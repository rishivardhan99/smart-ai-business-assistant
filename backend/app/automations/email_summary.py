# backend/app/automations/email_summary.py
import json
from app.services.llm_router import LLMRouter

def summarize_email(email_body: str) -> dict:
    """
    Summarizes a long email into key action items and main points.
    Returns a dictionary with 'summary' and 'action_items'.
    """
    sys_prompt = "You are an AI assistant that summarizes emails. Output JSON format strictly with keys 'summary' and 'action_items' (a list)."
    user_prompt = f"Please summarize this email:\n\n{email_body}"
    
    response = LLMRouter.generate_response(sys_prompt, user_prompt)
    
    try:
        # Try to parse the JSON output from the LLM
        clean_json = response.strip().strip('```json').strip('```')
        return json.loads(clean_json)
    except Exception:
        # Fallback if LLM didn't return perfect JSON
        return {
            "summary": response,
            "action_items": []
        }
