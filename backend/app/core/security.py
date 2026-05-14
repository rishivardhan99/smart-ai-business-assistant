# backend/app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Default fallback, should be set in .env
        expire = datetime.now(timezone.utc) + timedelta(minutes=1440)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    
    # We will use the DATABASE_URL as a fallback secret if JWT_SECRET_KEY is not set
    # In a real app, you MUST set JWT_SECRET_KEY in the config
    secret_key = getattr(settings, "JWT_SECRET_KEY", "supersecretkey")
    
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
