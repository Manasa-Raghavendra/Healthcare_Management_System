# app/db.py
from sqlmodel import SQLModel, create_engine, Session
from .config import settings

# Use echo=True during early dev for SQL logs; set to False later
engine = create_engine(settings.DATABASE_URL, echo=True, pool_pre_ping=True)


def get_session():
    """
    Use this helper as a dependency in FastAPI routes:
        with get_session() as session:
            ...
    Or use dependency injection by wrapping yield if you want DI.
    """
    with Session(engine) as session:
        yield session


def init_db():
    """
    Create DB tables. Call on startup.
    """
    SQLModel.metadata.create_all(engine)
