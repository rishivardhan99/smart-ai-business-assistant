# backend/app/rag/retriever.py
from app.rag.ingestion import get_vector_store
import logging

logger = logging.getLogger(__name__)

def retrieve_relevant_chunks(user_input: str, top_k: int = 6) -> list[str]:
    """Retrieves the most relevant document chunks from PostgreSQL."""
    try:
        vector_store = get_vector_store()
        
        # Perform similarity search
        results = vector_store.similarity_search(user_input, k=top_k)
        
        # Extract the text content from the matched documents
        chunks = [doc.page_content for doc in results]
        return chunks
        
    except Exception as e:
        logger.error(f"Retrieval failed: {e}")
        # Return empty list so the graph doesn't crash, it just answers without context
        return []