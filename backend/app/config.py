# app/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "SecureCare API"

    # Database
    DATABASE_URL: str = "sqlite:///./securecare_dev.db"

    # Backblaze (S3-compatible)
    B2_KEY_ID: str = ""
    B2_APPLICATION_KEY: str = ""
    B2_BUCKET: str = ""
    B2_ENDPOINT: str = ""

    # Demo master key used to wrap DEKs (Fernet) — for student/demo only
    MASTER_FERNET_KEY: str = ""

    # JWT secret for signing tokens (dev default provided so app boots even without .env)
    JWT_SECRET_KEY: str = "dev_secret_change_me"

    # App
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
