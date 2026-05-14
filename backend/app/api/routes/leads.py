
from http.client import HTTPException

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.lead import Lead

router = APIRouter(prefix="/leads", tags=["Leads"])

@router.get("/")
def get_all_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch all captured leads for the dashboard."""
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()
    return leads


@router.post("/{lead_id}/sync")
def sync_lead_to_crm(
    lead_id: str, 
    db: Session = Depends(get_db)
    # current_user: User = Depends(get_current_user) # Keep auth if you have it
):
    """Marks a lead as synced and triggers the CRM push."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    if lead.status == "synced":
        return {"message": "Lead is already synced", "status": "synced"}

    # ---> HERE is where you would put your actual external API call to HubSpot/Salesforce <---
    # Example: requests.post("https://api.hubapi.com/...", json={"email": lead.email})
    
    # Update our database to reflect the successful sync
    lead.status = "synced"
    db.commit()
    
    return {"message": "Successfully synced to CRM", "status": "synced"}