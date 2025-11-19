# app/schemas.py
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr


# -------------------------
# Auth / User
# -------------------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserRead(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None

    class Config:
        orm_mode = True


# -------------------------
# Patient
# -------------------------
class PatientCreate(BaseModel):
    name: str
    age: Optional[int] = None
    condition: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None


class PatientRead(BaseModel):
    id: int
    name: str
    age: Optional[int]
    condition: Optional[str]
    gender: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    emergency_contact: Optional[str]
    medical_history: Optional[str]
    allergies: Optional[str]
    current_medications: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True



# -------------------------
# FileRecord metadata
# -------------------------
class FileRecordCreate(BaseModel):
    patient_id: int
    filename: str
    # file uploaded as multipart in route; this schema is for metadata only


class FileRecordRead(BaseModel):
    id: int
    patient_id: int
    filename: str
    file_key: str
    uploaded_at: datetime

    class Config:
        orm_mode = True


# -------------------------
# Audit log
# -------------------------
class AuditLogRead(BaseModel):
    id: int
    actor_id: Optional[str]
    actor_role: Optional[str]
    action: str
    target_type: Optional[str]
    target_id: Optional[str]
    timestamp: datetime
    summary: Optional[str]

    class Config:
        orm_mode = True
