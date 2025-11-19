# backend/app/routes/files.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status, Form
from fastapi.responses import StreamingResponse
from typing import Optional, List
from io import BytesIO
import uuid
import mimetypes

from app import crud, schemas
from app.auth import get_current_user
from app.services import b2_client, crypto
from app.config import settings

router = APIRouter(prefix="/files", tags=["files"])


# ============================================================
# 📌 UPLOAD FILE
# ============================================================
@router.post("/upload", response_model=schemas.FileRecordRead, status_code=status.HTTP_201_CREATED)
async def upload_file(
    patient_id: int = Form(...),
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
):
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")

    content_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"

    # 1) Create DEK
    dek = crypto.generate_dek()

    # 2) Encrypt file
    encrypted = crypto.encrypt_aes_gcm(raw, dek)

    # 3) Wrap DEK
    wrapped_dek = crypto.wrap_dek(dek)

    # 4) Create B2 object key
    file_key = f"patients/{patient_id}/{uuid.uuid4()}-{file.filename}"

    # 5) Upload encrypted file to B2
    try:
        b2_client.upload_bytes(
            bucket=settings.B2_BUCKET,
            key=file_key,
            data=encrypted,
            content_type="application/octet-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed uploading to storage: {e}")

    # 6) Save metadata
    try:
        rec = crud.create_file_record(
            patient_id=patient_id,
            file_key=file_key,
            filename=file.filename,
            wrapped_dek=wrapped_dek
        )
    except Exception as e:
        # cleanup in case metadata fails
        try:
            b2_client.get_s3_client().delete_object(Bucket=settings.B2_BUCKET, Key=file_key)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Failed saving metadata: {e}")

    return rec


# ============================================================
# 📌 DOWNLOAD FILE (attachment)
# ============================================================
@router.get("/{file_id}/download")
def download_file(file_id: int, current_user = Depends(get_current_user)):
    rec = crud.get_file_record(file_id)
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")

    # Download encrypted bytes from B2
    try:
        encrypted = b2_client.download_bytes(settings.B2_BUCKET, rec.file_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed reading storage: {e}")

    # Unwrap DEK + decrypt
    try:
        dek = crypto.unwrap_dek(rec.wrapped_dek)
        plaintext = crypto.decrypt_aes_gcm(encrypted, dek)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {e}")

    return StreamingResponse(
        BytesIO(plaintext),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{rec.filename}"'}
    )


# ============================================================
# 📌 VIEW (DECRYPTED) — preview inline in browser
# ============================================================
@router.get("/{file_id}/view-decrypted")
def view_decrypted_file(file_id: int, current_user = Depends(get_current_user)):
    """
    Decrypt the stored file server-side and stream plaintext back inline.
    Use this for previewing (browser will render PDFs/images inline).
    Requires normal Bearer auth (get_current_user).
    """
    rec = crud.get_file_record(file_id)
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")

    # 1) Download encrypted bytes from B2
    try:
        encrypted = b2_client.download_bytes(settings.B2_BUCKET, rec.file_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed reading storage: {e}")

    # 2) Unwrap DEK + decrypt
    try:
        dek = crypto.unwrap_dek(rec.wrapped_dek)
        plaintext = crypto.decrypt_aes_gcm(encrypted, dek)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {e}")

    # 3) Determine media type from filename (fallback to octet-stream)
    guessed, _ = mimetypes.guess_type(rec.filename)
    media_type = guessed or "application/octet-stream"

    # 4) Stream plaintext back (inline so browser can preview)
    return StreamingResponse(
        BytesIO(plaintext),
        media_type=media_type,
        headers={"Content-Disposition": f'inline; filename="{rec.filename}"'}
    )


# ============================================================
# 📌 LIST FILES FOR A PATIENT
# ============================================================
@router.get("/patient/{patient_id}", response_model=List[schemas.FileRecordRead])
def list_patient_files(patient_id: int, current_user = Depends(get_current_user)):
    if not crud.patient_exists(patient_id):
        raise HTTPException(status_code=404, detail="Patient not found")

    return crud.list_files_for_patient(patient_id)


# ============================================================
# 📌 DELETE FILE
# ============================================================
@router.delete("/{file_id}", status_code=200)
def delete_file(file_id: int, current_user = Depends(get_current_user)):
    rec = crud.get_file_record(file_id)
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")

    # 1) Delete encrypted file from B2
    try:
        s3 = b2_client.get_s3_client()
        s3.delete_object(Bucket=settings.B2_BUCKET, Key=rec.file_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed deleting from storage: {e}")

    # 2) Delete metadata from DB
    success = crud.delete_file_record(file_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed deleting file metadata")

    return {"ok": True, "message": "File deleted"}


# ============================================================
# 📌 OPTIONAL: PRESIGNED DOWNLOAD URL
# ============================================================
@router.get("/{file_id}/presigned")
def get_presigned_url(file_id: int, current_user = Depends(get_current_user)):
    rec = crud.get_file_record(file_id)
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")

    url = b2_client.generate_presigned_get(
        settings.B2_BUCKET,
        rec.file_key,
        expires_in=3600
    )
    return {"url": url}
