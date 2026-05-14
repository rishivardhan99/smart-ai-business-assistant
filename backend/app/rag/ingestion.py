# backend/app/rag/ingestion.py
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
# Import the new local embedding class
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_postgres.vectorstores import PGVector
import tempfile
import os

from app.core.config import settings
from app.db.database import engine

def get_vector_store():
    """Initializes the pgvector store connected to your PostgreSQL DB."""
    
    # Use a fast, highly reliable local embedding model
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )
    
    return PGVector(
        embeddings=embeddings,
        collection_name="business_documents",
        connection=engine, 
        use_jsonb=True,
    )

def chunk_and_store_document(file_content: bytes, filename: str, source_metadata: dict) -> list[str]:
    """Extracts text from a PDF, chunks it, and stores it in pgvector."""
    
    # 1. Temporarily save the uploaded bytes to process with PyPDFLoader
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(file_content)
        tmp_path = tmp_file.name

    try:
        # 2. Load and extract text
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()
        
        for doc in docs:
            doc.metadata.update(source_metadata)
            
        # 3. Chunk the text semantics
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        chunks = text_splitter.split_documents(docs)
        
        # 4. Store in PostgreSQL Vector DB
        vector_store = get_vector_store()
        chunk_ids = vector_store.add_documents(chunks)
        
        return chunk_ids
        
    finally:
        # Clean up the temp file
        os.remove(tmp_path)