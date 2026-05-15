# backend/app/automations/calendar_utils.py
from ics import Calendar, Event
from datetime import datetime, timedelta

def generate_calendar_invite(lead_name: str, meeting_type: str, start_time_str: str) -> str:
    """
    Generates a standard .ics file for Google/Outlook.
    start_time_str format: "YYYY-MM-DD HH:MM:SS" (e.g., "2026-05-20 15:00:00")
    """
    c = Calendar()
    e = Event()
    
    # Fallback name if none provided
    display_name = lead_name if lead_name else "Client"
    
    e.name = f"{meeting_type}: {display_name} x SmartAI"
    
    # Parse the string into a datetime object for ics
    e.begin = datetime.strptime(start_time_str, "%Y-%m-%d %H:%M:%S")
    e.duration = timedelta(minutes=30)
    e.description = f"Automated discussion regarding AI integration and {meeting_type}."
    
    c.events.add(e)
    return str(c)