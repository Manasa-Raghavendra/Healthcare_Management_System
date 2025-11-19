# app/routes/audit.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app import crud, schemas
from app.auth import require_admin, get_current_user

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/", response_model=List[schemas.AuditLogRead])
def list_audit_logs(limit: int = 200, offset: int = 0, current_user=Depends(get_current_user)):
    """
    List audit logs. Only admin users can access this endpoint.
    """
    # require_admin will raise 403 if not admin
    require_admin(current_user)

    return crud.list_audit_logs(limit=limit, offset=offset)


@router.get("/{log_id}", response_model=schemas.AuditLogRead)
def get_audit_log(log_id: int, current_user=Depends(get_current_user)):
    """
    Get single audit log by id (admin only).
    """
    require_admin(current_user)
    logs = crud.list_audit_logs(limit=1, offset=0)
    # crud currently doesn't have get_audit_log; we can fetch the list and filter
    for l in logs:
        if l.id == log_id:
            return l
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit log not found")

def log_action(db, actor_id, actor_role, action, target_type=None, target_id=None, summary=None):
    from app import models
    entry = models.AuditLog(
        actor_id=actor_id,
        actor_role=actor_role,
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id else None,
        summary=summary,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
