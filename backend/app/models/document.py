
from sqlalchemy import Column, DateTime, String, ForeignKey, Integer, func
from sqlalchemy.orm import relationship
from uuid import uuid4

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    uploaded_by = Column(String, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="processing") # processing, ready, failed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chunks = relationship("DocumentChunk", back_populates="document")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    text_content = Column(String, nullable=False)
    page_number = Column(Integer, nullable=True)

    # We won't store vector embeddings in SQL directly if we are using ChromaDB as requested.
    # We will just store the metadata here if needed, but ChromaDB can hold both.
    # Having it here gives a relational fallback.

    document = relationship("Document", back_populates="chunks")
