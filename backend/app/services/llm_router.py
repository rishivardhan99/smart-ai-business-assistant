import json
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMRouter:
    _primary_llm = None
    _fallback_llm = None

    @classmethod
    def get_primary(cls):
        """Singleton pattern for the primary model."""
        if cls._primary_llm is None:
            cls._primary_llm = ChatGoogleGenerativeAI(
                # Use the -latest tag or fallback to gemini-pro if this still gives a 404
                model="gemini-1.5-flash-latest", 
                temperature=0.2,
                google_api_key=settings.GOOGLE_API_KEY 
            )
        return cls._primary_llm

    @classmethod
    def get_fallback(cls):
        """Singleton pattern for the fallback model."""
        if cls._fallback_llm is None:
            cls._fallback_llm = ChatGroq(
                # Updated to Groq's current active Llama 3.1 model
                model_name="llama-3.1-8b-instant", 
                temperature=0.2,
                groq_api_key=settings.GROQ_API_KEY 
            )
        return cls._fallback_llm
    @classmethod
    def generate_response(cls, system_prompt: str, user_input: str) -> str:
        """Generates standard text response with built-in failover."""
        messages = [
            ("system", system_prompt),
            ("human", user_input)
        ]
        
        try:
            llm = cls.get_primary()
            response = llm.invoke(messages)
            return response.content
        except Exception as e:
            logger.warning(f"Primary LLM failed: {e}. Switching to fallback.")
            try:
                llm = cls.get_fallback()
                response = llm.invoke(messages)
                return response.content
            except Exception as fallback_e:
                logger.error(f"Fallback LLM also failed: {fallback_e}")
                return "I'm currently experiencing high traffic. Please try again in a moment."

    @classmethod
    def generate_structured(cls, system_prompt: str, user_input: str) -> dict:
        """Forces the LLM to return a JSON object, catching parsing errors."""
        json_prompt = system_prompt + "\n\nRespond ONLY with valid JSON. Do not include markdown blocks like ```json."
        raw_response = cls.generate_response(json_prompt, user_input)
        
        try:
            clean_json = raw_response.strip().strip('```json').strip('```').strip()
            return json.loads(clean_json)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from LLM. Raw output: {raw_response}")
            return {"error": "Invalid JSON generated"}