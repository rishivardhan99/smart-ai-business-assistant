# backend/app/automations/lead_worker.py
import requests
from app.models.lead import Lead
from app.services.llm_router import LLMRouter
from app.db.database import SessionLocal # Import your DB session maker

def process_new_lead(extracted_data: dict, conversation_id: str):
    """
    Runs autonomously in the background to score leads, draft emails, and fire webhooks.
    """
    if not extracted_data or not extracted_data.get("email"):
        return

    # Open a fresh database session specifically for this background task
    db = SessionLocal()
    
    try:
        email = extracted_data.get("email")
        
        # 1. Prevent duplicates
        existing_lead = db.query(Lead).filter(Lead.email == email).first()
        if existing_lead:
            return
            
        # 2. Calculate AI Confidence Score based on extraction quality
        fields = ["name", "email", "company", "budget", "urgency_score"]
        filled_fields = sum(1 for field in fields if extracted_data.get(field) is not None)
        confidence = round((filled_fields / len(fields)) * 100, 1)

        # 3. Determine Status & Urgency safely
        try:
            urgency = float(extracted_data.get("urgency_score", 0))
        except:
            urgency = 0.0
            
        status = "hot" if urgency >= 70 else "warm" if urgency >= 40 else "cold"

        # 4. Autonomous Action: AI Drafts the Follow-Up Email
        draft_prompt = f"""
        Write a short, professional, and friendly follow-up email for a new business lead.
        Name: {extracted_data.get('name', 'there')}
        Company: {extracted_data.get('company', 'your company')}
        
        Thank them for chatting with our AI assistant today, and ask for a quick 10-minute discovery call next week.
        Sign it from 'The Operations Team'. Do not use placeholders. Keep it under 4 sentences.
        """
        email_draft = LLMRouter.generate_response("You are an expert sales copywriter.", draft_prompt).strip()

        # 5. Save everything to PostgreSQL
        new_lead = Lead(
            name=extracted_data.get("name"),
            email=email,
            company=extracted_data.get("company"),
            budget_range=str(extracted_data.get("budget", "")),
            status=status,
            score=urgency,
            confidence_score=confidence,
            follow_up_draft=email_draft,
            conversation_id=conversation_id
        )
        db.add(new_lead)
        db.commit()
        db.refresh(new_lead)

        # 6. The "Wow Factor" - Fire an External Webhook
        # To test this, go to https://webhook.site/, copy "Your unique URL", and paste it here:
        WEBHOOK_URL = "https://webhook.site/REPLACE-WITH-YOUR-UUID" 
        
        payload = {
            "event": "new_lead_captured",
            "lead_id": new_lead.id,
            "name": new_lead.name,
            "email": new_lead.email,
            "status": new_lead.status,
            "confidence": new_lead.confidence_score
        }
        
        try:
            requests.post(WEBHOOK_URL, json=payload, timeout=5)
            print(f"🚀 Webhook fired successfully for lead: {new_lead.email}")
        except Exception as e:
            print(f"⚠️ Webhook failed (non-fatal): {e}")

    except Exception as e:
        print(f"❌ Error in autonomous lead worker: {e}")
    finally:
        # Always close the background session to prevent memory leaks
        db.close()