## backend/app/automations/sheets_sync.py
def sync_lead_to_sheets(lead_data: dict) -> bool:
    """
    Mock function to simulate syncing a lead to Google Sheets.
    In a real-world scenario, this would use the Google Sheets API.
    """
    print(f"Syncing lead to Google Sheets: {lead_data.get('name')} - {lead_data.get('email')}")
    
    # Simulate API success
    return True
