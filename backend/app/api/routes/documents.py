# backend/app/api/routes/documents.py
import os
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.rag.ingestion import chunk_and_store_document

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../../../uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -------------------------------------------------------------------
# 1. NEW: The GET route so the React UI can list existing documents
# -------------------------------------------------------------------
@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch all uploaded documents for the dashboard."""
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return {"documents": docs}


# -------------------------------------------------------------------
# 2. YOUR EXISTING: The POST route for handling the drag-and-drop
# -------------------------------------------------------------------
@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure we only accept PDFs for the new RAG pipeline
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only .pdf files are supported.")
        
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    # Read the raw bytes (PDFs are binary, so no UTF-8 decoding)
    content = await file.read()
    
    # Save the file locally for reference/auditing
    with open(file_path, "wb") as f:
        f.write(content)
        
    # Create the Document record in PostgreSQL
    db_doc = Document(
        filename=file.filename,
        file_path=file_path,
        uploaded_by=current_user.id,
        status="processing"
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    try:
        # Process and store in pgvector via the ingestion pipeline
        source_meta = {"source": file.filename, "document_id": str(db_doc.id)}
        
        # Pass the raw bytes and filename directly
        chunk_ids = chunk_and_store_document(
            file_content=content, 
            filename=file.filename,
            source_metadata=source_meta
        )
        
        # Save chunk metadata in SQL
        for i, chunk_id in enumerate(chunk_ids):
            db_chunk = DocumentChunk(
                id=str(chunk_id),
                document_id=db_doc.id,
                chunk_index=i,
                text_content=f"Chunk {i} stored in pgvector database" 
            )
            db.add(db_chunk)
            
        db_doc.status = "ready"
        db.commit()
        
    except Exception as e:
        db_doc.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
        
    return {
        "message": "Document uploaded and processed successfully", 
        "document_id": str(db_doc.id)
    }


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes a document from the database and removes the physical file."""
    # 1. Fetch the document
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 2. Delete the physical file from the server
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            print(f"Warning: Failed to delete physical file {doc.file_path}: {e}")

    try:
        # 3. Clean up the database (Manually delete chunks first to prevent foreign key errors)
        db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
        
        # 4. Delete the main document record
        db.delete(doc)
        db.commit()
        
        # Note: If your pgvector/ChromaDB ingestion has a built-in delete method, 
        # you would call it here (e.g., vector_store.delete(where={"document_id": document_id}))
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete document from database: {str(e)}")

    return {"message": f"Successfully deleted {doc.filename}"}