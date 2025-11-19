from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import datetime
import uuid


def gen_uuid() -> str:
    return str(uuid.uuid4())


# -------------------------
# USER
# -------------------------
class User(SQLModel, table=True):
    id: str = Field(default_factory=gen_uuid, primary_key=True)
    email: str = Field(index=True, nullable=False, unique=True)
    hashed_password: str
    full_name: Optional[str] = None
    role: Optional[str] = Field(default="doctor")  # "doctor" or "admin"
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    # Relationships
    appointments: List["Appointment"] = Relationship(back_populates="doctor")


# -------------------------
# PATIENT
# -------------------------
class Patient(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
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

    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    # Reverse relations
    files: List["FileRecord"] = Relationship(back_populates="patient")
    appointments: List["Appointment"] = Relationship(back_populates="patient")


# -------------------------
# FILERECORD
# -------------------------
class FileRecord(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    file_key: str
    filename: str
    wrapped_dek: Optional[str] = None
    uploaded_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    # Reverse relation
    patient: Optional[Patient] = Relationship(back_populates="files")


# -------------------------
# APPOINTMENT
# -------------------------
class Appointment(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)

    patient_id: int = Field(foreign_key="patient.id")
    doctor_id: Optional[str] = Field(default=None, foreign_key="user.id")

    start_at: datetime.datetime
    end_at: Optional[datetime.datetime] = None
    notes: Optional[str] = None
    status: str = Field(default="scheduled")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    # Relationships
    patient: Optional[Patient] = Relationship(back_populates="appointments")
    doctor: Optional[User] = Relationship(back_populates="appointments")


# -------------------------
# AUDIT LOG
# -------------------------
class AuditLog(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    actor_id: Optional[str] = Field(default=None)
    actor_role: Optional[str] = None
    action: str
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    summary: Optional[str] = None
