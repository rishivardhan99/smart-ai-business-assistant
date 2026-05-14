# backend/app/api/routes/traces.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.trace import AgentTrace

router = APIRouter(prefix="/traces", tags=["Traces"])

@router.get("/")
def get_recent_traces(db: Session = Depends(get_db)):
    """Fetch the latest LangGraph agent executions for the observability dashboard."""
    traces = db.query(AgentTrace).order_by(AgentTrace.created_at.desc()).limit(50).all()
    return {"traces": traces}