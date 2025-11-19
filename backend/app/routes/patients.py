# app/routes/patients.py
from fastapi import APIRouter, HTTPException, status
from typing import List

from app import crud, schemas

router = APIRouter(prefix="/patients", tags=["patients"])


@router.post("/", response_model=schemas.PatientRead)
def create_patient(payload: schemas.PatientCreate):
    return crud.create_patient(**payload.dict())



@router.get("/", response_model=List[schemas.PatientRead])
def list_patients():
    """
    List patients (simple pagination not implemented).
    """
    return crud.list_patients(limit=200, offset=0)


@router.get("/{patient_id}", response_model=schemas.PatientRead)
def get_patient(patient_id: int):
    """
    Get patient details by id.
    """
    p = crud.get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return p


@router.put("/{patient_id}", response_model=schemas.PatientRead)
def update_patient(patient_id: int, payload: schemas.PatientCreate):
    updated = crud.update_patient(patient_id, payload.dict())
    if not updated:
        raise HTTPException(404, "Patient not found")
    return updated



@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: int):
    """
    Delete a patient record.
    """
    ok = crud.delete_patient(patient_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {}
