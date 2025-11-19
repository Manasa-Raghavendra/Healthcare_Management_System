from typing import List, Optional, Dict, Any
from sqlmodel import Session, select
from datetime import datetime

from .models import User, Patient, FileRecord, AuditLog
from .db import engine


# -------------------------
# USER HELPERS
# -------------------------
def create_user(email: str, hashed_password: str, full_name: Optional[str] = None, role: str = "doctor") -> User:
    with Session(engine) as session:
        user = User(email=email, hashed_password=hashed_password, full_name=full_name, role=role)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


def get_user_by_email(email: str) -> Optional[User]:
    with Session(engine) as session:
        statement = select(User).where(User.email == email)
        return session.exec(statement).first()


def get_user_by_id(user_id: str) -> Optional[User]:
    with Session(engine) as session:
        return session.get(User, user_id)


def doctor_exists(doctor_id: str) -> bool:
    with Session(engine) as session:
        return session.get(User, doctor_id) is not None


# -------------------------
# PATIENT HELPERS
# -------------------------
def create_patient(**data) -> Patient:
    with Session(engine) as session:
        p = Patient(**data)
        session.add(p)
        session.commit()
        session.refresh(p)
        return p


def get_patient(patient_id: int) -> Optional[Patient]:
    with Session(engine) as session:
        return session.get(Patient, patient_id)


def patient_exists(patient_id: int) -> bool:
    with Session(engine) as session:
        return session.get(Patient, patient_id) is not None


def list_patients(limit: int = 100, offset: int = 0) -> List[Patient]:
    with Session(engine) as session:
        statement = select(Patient).offset(offset).limit(limit)
        return session.exec(statement).all()


def update_patient(patient_id: int, data: Dict[str, Any]) -> Optional[Patient]:
    with Session(engine) as session:
        patient = session.get(Patient, patient_id)
        if not patient:
            return None

        for k, v in data.items():
            if hasattr(patient, k) and v is not None:
                setattr(patient, k, v)

        session.add(patient)
        session.commit()
        session.refresh(patient)
        return patient


def delete_patient(patient_id: int) -> bool:
    with Session(engine) as session:
        patient = session.get(Patient, patient_id)
        if not patient:
            return False
        session.delete(patient)
        session.commit()
        return True




# -------------------------
# FILE HELPERS
# -------------------------
def create_file_record(
    patient_id: int, file_key: str, filename: str, wrapped_dek: Optional[str] = None
) -> FileRecord:
    with Session(engine) as session:
        fr = FileRecord(
            patient_id=patient_id,
            file_key=file_key,
            filename=filename,
            wrapped_dek=wrapped_dek,
        )
        session.add(fr)
        session.commit()
        session.refresh(fr)
        return fr


def get_file_record(file_id: int) -> Optional[FileRecord]:
    with Session(engine) as session:
        return session.get(FileRecord, file_id)


def list_files_for_patient(patient_id: int, limit: int = 100, offset: int = 0) -> List[FileRecord]:
    with Session(engine) as session:
        statement = (
            select(FileRecord)
            .where(FileRecord.patient_id == patient_id)
            .offset(offset)
            .limit(limit)
        )
        return session.exec(statement).all()


def delete_file_record(file_id: int) -> bool:
    with Session(engine) as session:
        rec = session.get(FileRecord, file_id)
        if not rec:
            return False
        session.delete(rec)
        session.commit()
        return True


# -------------------------
# AUDIT LOG HELPERS
# -------------------------
def create_audit_log(
    actor_id: Optional[str],
    actor_role: Optional[str],
    action: str,
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    summary: Optional[str] = None,
) -> AuditLog:
    with Session(engine) as session:
        log = AuditLog(
            actor_id=actor_id,
            actor_role=actor_role,
            action=action,
            target_type=target_type,
            target_id=target_id,
            summary=summary,
        )
        session.add(log)
        session.commit()
        session.refresh(log)
        return log


def list_audit_logs(limit: int = 100, offset: int = 0) -> List[AuditLog]:
    with Session(engine) as session:
        statement = select(AuditLog).offset(offset).limit(limit)
        return session.exec(statement).all()
