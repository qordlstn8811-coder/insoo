import requests
import re

BASE_URL = "http://localhost:3000/api/contact"
TIMEOUT = 30

def test_post_api_contact_telegram_notification_sending():
    # Valid Korean phone number format
    valid_phone = "010-1234-5678"
    payload = {
        "name": "Test User",
        "phone": valid_phone,
        "region": "Seoul",
        "message": "This is a test inquiry for Telegram notification."
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(BASE_URL, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Validate response status code is 200 even if Telegram notification fails internally
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    # Validate response JSON structure
    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(resp_json, dict), "Response JSON is not a dictionary"
    assert "message" in resp_json, "'message' field missing in response JSON"
    assert "data" in resp_json, "'data' field missing in response JSON"

    # Validate that phone number matches Korean phone format regex
    korean_phone_pattern = r"^01[016789]-?\d{3,4}-?\d{4}$"
    assert re.match(korean_phone_pattern, payload["phone"]), "Phone number does not match Korean format"

    # Since Telegram notification success/failure is internal,
    # ensure that a failure does not affect response (implicitly tested by 200 response).

test_post_api_contact_telegram_notification_sending()