# backend/app/api/routes/leads.py
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.db.session import get_db
# from app.api.dependencies import get_current_user # uncomment if using auth
# from app.models.user import User                  # uncomment if using auth
from app.models.lead import Lead

# Import the automations
from app.automations.sheets_sync import sync_lead_to_sheets
from app.automations.calendar_utils import generate_calendar_invite

router = APIRouter(prefix="/leads", tags=["Leads"])

@router.get("/")
def get_all_leads(db: Session = Depends(get_db)):
    """Fetch all captured leads for the dashboard."""
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()
    return leads


@router.post("/{lead_id}/sync")
def sync_lead_to_crm(lead_id: str, db: Session = Depends(get_db)):
    """Marks a lead as synced and triggers the Google Sheets CRM push."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    if lead.status == "synced":
        return {"message": "Lead is already synced", "status": "synced"}

    # Format the data for the Sheets Sync function
    lead_data = {
        "name": lead.name,
        "email": lead.email,
        "company": lead.company,
        "requirement": lead.use_case or "N/A",
        "confidence_score": lead.confidence_score,
        "status": "Approved"
    }

    # Execute the Google Sheets automation (Now unwrapping the tuple!)
    success, error_message = sync_lead_to_sheets(lead_data)
    
    if success:
        lead.status = "synced"
        db.commit()
        return {"message": "Successfully synced to Google Sheets", "status": "synced"}
    else:
        # This will send the EXACT Python error back to React!
        raise HTTPException(status_code=500, detail=f"Sync Failed: {error_message}")
from pydantic import BaseModel

class DraftUpdate(BaseModel):
    draft: str

@router.put("/{lead_id}/draft")
def update_lead_draft(lead_id: str, payload: DraftUpdate, db: Session = Depends(get_db)):
    """Allows admins to edit the AI-generated draft before syncing."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    lead.follow_up_draft = payload.draft
    db.commit()
    return {"message": "Draft saved successfully", "draft": lead.follow_up_draft}


@router.get("/{lead_id}/calendar")
def download_calendar_invite(lead_id: str, db: Session = Depends(get_db)):
    """Generates and returns an .ics file for download."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    # Schedule the meeting for 2 days from now at 3 PM
    meeting_date = (datetime.utcnow() + timedelta(days=2)).replace(hour=15, minute=0, second=0)
    
    ics_content = generate_calendar_invite(
        lead_name=lead.name, 
        meeting_type="AI Discovery Call", 
        start_time_str=meeting_date.strftime("%Y-%m-%d %H:%M:%S")
    )
    
    # Return as a downloadable file
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=meeting_with_{lead.name or 'client'}.ics"}
    )


router.delete("/purge")
def purge_all_leads(db: Session = Depends(get_db)):
    """WARNING: Permanently deletes all leads from the database."""
    try:
        # This deletes all rows in the leads table and returns the count
        num_deleted = db.query(Lead).delete()
        db.commit()
        return {"message": f"Successfully purged {num_deleted} leads."}
    except Exception as e:
        db.rollback() # Important: undo the transaction if it fails
        raise HTTPException(status_code=500, detail=f"Failed to purge database: {str(e)}")