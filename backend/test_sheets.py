import os
from dotenv import load_dotenv
import gspread
from google.oauth2.service_account import Credentials

# 1. Force load the .env file
load_dotenv()

print("--- DIAGNOSTIC TEST ---")
sheet_id = os.getenv("GOOGLE_SHEET_ID")
print(f"1. GOOGLE_SHEET_ID from .env: {sheet_id}")

cred_path = "service_account.json"
if os.path.exists(cred_path):
    print(f"2. Service Account File: ✅ FOUND in {os.getcwd()}")
else:
    print(f"2. Service Account File: ❌ MISSING in {os.getcwd()}")

print("3. Attempting connection to Google API...")
try:
    SCOPES = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]
    credentials = Credentials.from_service_account_file(cred_path, scopes=SCOPES)
    client = gspread.authorize(credentials)
    
    # Try to open the sheet
    sheet = client.open_by_key(sheet_id).sheet1
    print("✅ SUCCESS! The backend can see and edit the Google Sheet.")
except Exception as e:
    print(f"\n❌ CONNECTION FAILED: {e}")
    print("---------------------------------------------------------")
    print("READ THIS ERROR CAREFULLY TO KNOW EXACTLY WHAT TO FIX!")