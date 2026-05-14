# backend/app/api/routes/chat.py
import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse # <-- NEW IMPORT
from sqlalchemy.orm import Session
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage

from app.db.session import get_db
from app.models.conversation import Conversation, Message
from app.models.trace import AgentTrace
import time

from app.agents.graph import app_graph
from app.automations.lead_worker import process_new_lead

router = APIRouter(prefix="/chat", tags=["Chat"])

class PublicChatRequest(BaseModel):
    message: str
    session_id: str 

@router.post("/public")
async def public_chat(
    request: PublicChatRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. Retrieve or create conversation
    conversation = db.query(Conversation).filter(Conversation.session_id == request.session_id).first()
    if not conversation:
        conversation = Conversation(session_id=request.session_id, status="active")
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
    # 2. Load Chat History
    past_db_messages = db.query(Message).filter(Message.conversation_id == conversation.id).order_by(Message.id.asc()).limit(10).all()
    langchain_messages = [
        HumanMessage(content=msg.content) if msg.role == "user" else AIMessage(content=msg.content)
        for msg in past_db_messages
    ]

    # 3. Save new user message
    user_msg = Message(conversation_id=conversation.id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()

    langchain_messages.append(HumanMessage(content=request.message))

    # 4. Invoke LangGraph (Buffered to allow Validation)
    initial_state = {"messages": langchain_messages, "retry_count": 0}
    start_time = time.time()
    
    try:
        final_state = app_graph.invoke(initial_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph execution failed: {str(e)}")
        
    execution_time_ms = round((time.time() - start_time) * 1000, 2)
    assistant_reply = final_state.get("final_response", "I'm sorry, I couldn't process that.")
    extracted_lead = final_state.get("extracted_lead")
    
    # Save Trace & Assistant Message
    trace = AgentTrace(
        session_id=request.session_id,
        user_input=request.message,
        intent=final_state.get("intent", "general"),
        chunks_retrieved=len(final_state.get("context_chunks", [])),
        is_grounded=final_state.get("is_grounded", True),
        retry_count=final_state.get("retry_count", 0),
        execution_time_ms=execution_time_ms
    )
    db.add(trace)
    
    bot_msg = Message(conversation_id=conversation.id, role="assistant", content=assistant_reply)
    db.add(bot_msg)
    db.commit()
    
    # Handle Automation
    if extracted_lead and extracted_lead.get("email"):
        background_tasks.add_task(process_new_lead, extracted_lead, conversation.id)

    # ---------------------------------------------------------
    # 5. THE STREAMING GENERATOR
    # ---------------------------------------------------------
    async def stream_generator():
        """Yields the validated response token-by-token using SSE format."""
        
        # Split the string by spaces to simulate word-by-word streaming
        words = assistant_reply.split(" ")
        
        for i, word in enumerate(words):
            # Re-attach the space unless it's the last word
            chunk = word + (" " if i < len(words) - 1 else "")
            
            # Format as Server-Sent Event (SSE)
            data = json.dumps({"chunk": chunk, "intent": final_state.get("intent")})
            yield f"data: {data}\n\n"
            
            # Add a tiny artificial delay to simulate realistic typing speed
            await asyncio.sleep(0.03) 
            
        # Send a final 'done' signal
        yield f"data: [DONE]\n\n"

    # Return the StreamingResponse with the correct content type
    return StreamingResponse(stream_generator(), media_type="text/event-stream")