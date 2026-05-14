# backend/app/rag/embeddings.py
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_postgres.vectorstores import PGVector
from app.core.config import settings

def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=os.getenv("GEMINI_API_KEY")
    )

def get_vectorstore() -> PGVector:
    embeddings = get_embeddings()
    # Neon DB already supports pgvector natively!
    return PGVector(
        embeddings=embeddings,
        collection_name="smart_assistant_docs",
        connection=settings.get_database_url,
        use_jsonb=True,
    )
