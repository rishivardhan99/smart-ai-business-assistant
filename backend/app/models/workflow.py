# backend/app/models/workflow.py
from sqlalchemy import Column, DateTime, String, Text, ForeignKey, func
from uuid import uuid4

from app.db.database import Base


class WorkflowLog(Base):
    __tablename__ = "workflow_logs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    workflow_name = Column(String, nullable=False, index=True) # e.g. 'email_summary', 'sheets_sync'
    status = Column(String, nullable=False) # success, failed, running
    details = Column(Text, nullable=True) # JSON or text output
    triggered_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
