# backend/app/models/automation.py
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class TriagedEmail(Base):
    __tablename__ = "triaged_emails"

    id = Column(Integer, primary_key=True, index=True)
    sender_email = Column(String, index=True)
    subject = Column(String)
    original_content = Column(Text)
    
    # AI Extracted Data
    summary = Column(Text)
    action_items = Column(JSON) # Store the to-do list as a JSON array
    urgency = Column(String) # High, Medium, Low
    
    status = Column(String, default="pending") # pending, resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())