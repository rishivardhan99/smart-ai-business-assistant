# backend/app/models/trace.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float
from sqlalchemy.sql import func
from app.db.database import Base

class AgentTrace(Base):
    __tablename__ = "agent_traces"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    user_input = Column(String)
    
    # LangGraph Node States
    intent = Column(String) # from Planner
    chunks_retrieved = Column(Integer, default=0) # from Retriever
    is_grounded = Column(Boolean, default=True) # from Validator
    retry_count = Column(Integer, default=0) # from Validator
    
    # Performance Monitoring
    execution_time_ms = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())