# backend/app/services/groq_service.py
import os
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

def get_groq_model(temperature: float = 0.7, max_tokens: int = 1000):
    return ChatGroq(
        model="llama3-8b-8192", # Groq model identifier
        temperature=temperature,
        max_tokens=max_tokens,
        groq_api_key=os.getenv("GROQ_API_KEY"),
    )

def generate_groq_response(system_prompt: str, user_prompt: str) -> str:
    model = get_groq_model()
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]
    response = model.invoke(messages)
    return response.content
