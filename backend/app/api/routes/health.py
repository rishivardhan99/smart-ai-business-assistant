# backend/app/api/routes/health.py
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health_check():
    return {
        "status": "ok",
        "service": "smart-ai-business-assistant",
        "message": "Backend is running",
    }


@router.get("/db")
def database_health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {
        "status": "ok",
        "database": "connected",
    }