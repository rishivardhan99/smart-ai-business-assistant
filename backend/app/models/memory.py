# backend/app/models/memory.py
from sqlalchemy import Column, DateTime, String, Float, Text, ForeignKey, func
from uuid import uuid4

from app.db.database import Base


class MemoryItem(Base):
    __tablename__ = "memory_items"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True) # to tie memory to a specific user/client
    session_id = Column(String, nullable=True) # to tie memory to an anonymous session
    
    fact = Column(Text, nullable=False)
    importance_score = Column(Float, default=1.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
