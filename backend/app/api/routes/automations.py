# backend/app/api/routes/automations.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json

from app.db.session import get_db
from app.models.automation import TriagedEmail
from app.services.llm_router import LLMRouter

router = APIRouter(prefix="/automations", tags=["Automations"])

class IncomingEmailWebhook(BaseModel):
    sender: str
    subject: str
    body: str

def process_email_background(email_data: IncomingEmailWebhook, db: Session):
    """Background worker that triages the email without blocking the webhook response."""
    sys_prompt = """
    You are an expert executive assistant. Analyze this incoming client email.
    Output ONLY a valid JSON object with exactly these keys:
    - "summary": A concise 1-2 sentence summary of what the client wants.
    - "action_items": A list of strings containing specific tasks required.
    - "urgency": Rate it exactly as "High", "Medium", or "Low".
    """
    
    try:
        content_to_analyze = f"Subject: {email_data.subject}\nBody: {email_data.body}"
        result = LLMRouter.generate_structured(sys_prompt, content_to_analyze)
        
        # Safely parse JSON if returned as a string
        if isinstance(result, str):
            clean_json = result.strip().strip('```json').strip('```')
            result = json.loads(clean_json)

        # Save to database
        new_triage = TriagedEmail(
            sender_email=email_data.sender,
            subject=email_data.subject,
            original_content=email_data.body,
            summary=result.get("summary", "Failed to summarize."),
            action_items=result.get("action_items", []),
            urgency=result.get("urgency", "Medium")
        )
        db.add(new_triage)
        db.commit()
    except Exception as e:
        print(f"Failed to process webhook email: {e}")

@router.post("/webhook/email")
def receive_email_webhook(
    payload: IncomingEmailWebhook, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    The endpoint an external service (Gmail/Zapier) hits when a new email arrives.
    It instantly returns 200 OK, and processes the AI triage in the background.
    """
    background_tasks.add_task(process_email_background, payload, db)
    return {"status": "received", "message": "Email queued for AI triage"}

@router.get("/emails")
def get_triaged_emails(db: Session = Depends(get_db)):
    """Fetch all autonomously triaged emails for the dashboard feed."""
    emails = db.query(TriagedEmail).order_by(TriagedEmail.created_at.desc()).limit(20).all()
    return {"emails": emails}