# backend/app/agents/state.py
from typing import TypedDict, List, Optional
from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    messages: List[BaseMessage]
    intent: Optional[str] # e.g. "qa", "lead_capture", "automation", "general"
    context_chunks: List[str] # retrieved chunks
    final_response: Optional[str]
    is_grounded: Optional[bool]
    extracted_lead: Optional[dict]
    retry_count: int
