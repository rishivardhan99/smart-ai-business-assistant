# backend/app/automations/sheets_sync.py
import os
from pathlib import Path
import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime
from dotenv import load_dotenv

# --- BULLETPROOF PATHING ---
# This dynamically finds the absolute path to your 'backend' folder
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Force load the .env file using the absolute path
load_dotenv(BASE_DIR / ".env")

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

def sync_lead_to_sheets(lead_data: dict):
    """
    Appends approved lead data to Google Sheets.
    Returns: (bool success, str message)
    """
    try:
        # Resolve exact path to credentials
        cred_filename = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "service_account.json")
        cred_path = BASE_DIR / cred_filename
        sheet_id = os.getenv("GOOGLE_SHEET_ID")

        print("\n--- DIAGNOSTIC AUTOMATION TRIGGER ---")
        print(f"Looking for Credentials at: {cred_path}")
        print(f"Sheet ID: {sheet_id}")

        if not cred_path.exists():
            error_msg = f"Service account file not found at {cred_path}"
            print(f"❌ ERROR: {error_msg}")
            return False, error_msg
            
        if not sheet_id:
            error_msg = "GOOGLE_SHEET_ID missing from .env"
            print(f"❌ ERROR: {error_msg}")
            return False, error_msg

        # Authenticate
        credentials = Credentials.from_service_account_file(str(cred_path), scopes=SCOPES)
        client = gspread.authorize(credentials)

        # Open Sheet
        sheet = client.open_by_key(sheet_id).sheet1

        # Format Data exactly for your columns
        row_data = [
            datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
            lead_data.get("name", "Unknown"),
            lead_data.get("email", "Unknown"),
            lead_data.get("company", "N/A"),
            lead_data.get("requirement", "N/A"),
            f"{lead_data.get('confidence_score', 0)}%",
            lead_data.get("status", "Approved")
        ]

        # Append
        sheet.append_row(row_data)
        print(f"✅ SUCCESS: Lead '{lead_data.get('email')}' pushed to Google Sheets!")
        return True, "Success"

    except Exception as e:
        error_msg = str(e)
        print(f"❌ FATAL ERROR IN SYNC: {error_msg}")
        return False, error_msg