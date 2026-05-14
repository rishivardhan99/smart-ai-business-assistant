# backend/app/services/gemini_service.py
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

def get_gemini_model(temperature: float = 0.7, max_tokens: int = 1000):
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-pro-latest",
        temperature=temperature,
        max_output_tokens=max_tokens,
        google_api_key=os.getenv("GEMINI_API_KEY"),
    )

def generate_gemini_response(system_prompt: str, user_prompt: str) -> str:
    model = get_gemini_model()
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]
    response = model.invoke(messages)
    return response.content
