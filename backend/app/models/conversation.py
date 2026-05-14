# backend/app/models/conversation.py
from sqlalchemy import Column, DateTime, String, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from uuid import uuid4

from app.db.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True) # Can be null if anonymous session
    session_id = Column(String, index=True, nullable=False)
    status = Column(String, default="active")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    messages = relationship("Message", back_populates="conversation")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False) # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")
