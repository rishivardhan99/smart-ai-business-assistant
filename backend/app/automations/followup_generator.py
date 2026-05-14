# backend/app/automations/followup_generator.py
from app.services.llm_router import LLMRouter

def generate_followup_email(lead_name: str, use_case: str, context: str = "") -> str:
    """
    Generates a personalized follow-up email for a lead.
    """
    sys_prompt = "You are an expert sales representative. Write a professional, concise, and engaging follow-up email."
    user_prompt = f"Lead Name: {lead_name}\nUse Case/Interest: {use_case}\nAdditional Context: {context}\n\nPlease draft a follow-up email to try and schedule a quick intro call."
    
    response = LLMRouter.generate_response(sys_prompt, user_prompt)
    return response
