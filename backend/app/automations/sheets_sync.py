# backend/app/automations/sheets_sync.py

import os
import json
import gspread

from google.oauth2.service_account import Credentials
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]


def sync_lead_to_sheets(lead_data: dict):
    """
    Appends approved lead data to Google Sheets.
    Returns: (bool success, str message)
    """

    try:
        print("\n--- GOOGLE SHEETS AUTOMATION TRIGGER ---")

        # Load JSON credentials from environment variable
        service_account_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")

        if not service_account_json:
            error_msg = "GOOGLE_SERVICE_ACCOUNT_JSON missing from environment variables"
            print(f"❌ ERROR: {error_msg}")
            return False, error_msg

        # Parse JSON safely
        service_account_info = json.loads(service_account_json)

        # Sheet ID
        sheet_id = os.getenv("GOOGLE_SHEET_ID")

        if not sheet_id:
            error_msg = "GOOGLE_SHEET_ID missing from environment variables"
            print(f"❌ ERROR: {error_msg}")
            return False, error_msg

        # Authenticate
        credentials = Credentials.from_service_account_info(
            service_account_info,
            scopes=SCOPES
        )

        client = gspread.authorize(credentials)

        # Open Google Sheet
        sheet = client.open_by_key(sheet_id).sheet1

        # Prepare row data
        row_data = [
            datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
            lead_data.get("name", "Unknown"),
            lead_data.get("email", "Unknown"),
            lead_data.get("company", "N/A"),
            lead_data.get("requirement", "N/A"),
            f"{lead_data.get('confidence_score', 0)}%",
            lead_data.get("status", "Approved")
        ]

        # Append row
        sheet.append_row(row_data)

        success_msg = f"Lead '{lead_data.get('email')}' synced successfully"
        print(f"✅ SUCCESS: {success_msg}")

        return True, success_msg

    except Exception as e:
        error_msg = str(e)
        print(f"❌ FATAL ERROR: {error_msg}")
        return False, error_msg