from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from app.db import get_session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_db():
    return next(get_session())

