# backend/app/api/routes/analytics.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.lead import Lead
from app.models.conversation import Conversation
from app.models.trace import AgentTrace

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard-kpis")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Aggregates platform data for the admin dashboard."""
    
    # --- 1. Calculate KPIs ---
    total_leads = db.query(Lead).count()
    hot_leads = db.query(Lead).filter(Lead.status == "hot").count()
    
    # Calculate Average AI Extraction Confidence
    avg_conf = db.query(func.avg(Lead.confidence_score)).scalar()
    avg_confidence = round(avg_conf, 1) if avg_conf else 0.0

    # Calculate Hallucination/Retry Rate from Traces
    total_traces = db.query(AgentTrace).count()
    hallucinations = db.query(AgentTrace).filter(AgentTrace.is_grounded == False).count()
    hallucination_rate = round((hallucinations / total_traces) * 100, 1) if total_traces > 0 else 0.0

    metrics = [
        {"label": "Total Captured Leads", "value": str(total_leads), "icon": "Users"},
        {"label": "Hot Leads", "value": str(hot_leads), "icon": "Flame"},
        {"label": "Avg AI Confidence", "value": f"{avg_confidence}%", "icon": "Target"},
        {"label": "Hallucination Rate", "value": f"{hallucination_rate}%", "icon": "ShieldAlert"}
    ]

    # --- 2. Calculate Chart Data (Last 7 Days) ---
    chart_data = []
    today = datetime.utcnow().date()
    
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        
        # Count convos for this day
        convos = db.query(Conversation).filter(
            func.date(Conversation.created_at) == target_date
        ).count()
        
        # Count leads for this day
        leads = db.query(Lead).filter(
            func.date(Lead.created_at) == target_date
        ).count()
        
        chart_data.append({
            "name": target_date.strftime("%b %d"),
            "conversations": convos,
            "leads": leads
        })

    return {
        "metrics": metrics,
        "chartData": chart_data
    }