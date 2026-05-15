# backend/app/models/lead.py
from sqlalchemy import Column, DateTime, String, Float, ForeignKey, func, Text
from uuid import uuid4
from app.db.database import Base # Ensure this matches your project's Base import

class Lead(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    email = Column(String, nullable=True, index=True)
    phone = Column(String, nullable=True)
    use_case = Column(String, nullable=True)
    budget_range = Column(String, nullable=True)
    urgency = Column(String, nullable=True)
    lead_type = Column(String, nullable=True)
    
    # Changed default from "cold" to "Awaiting Review" for the automation pipeline
    status = Column(String, nullable=False, default="Awaiting Review") 
    score = Column(Float, default=0.0)
    
    # Track which conversation or session generated this lead
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=True)
    
    # --- AUTOMATION COLUMNS ---
    confidence_score = Column(Float, default=0.0)
    follow_up_draft = Column(Text, nullable=True)
    meeting_proposal = Column(Text, nullable=True) # NEW: Needed for Calendar Invites
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())