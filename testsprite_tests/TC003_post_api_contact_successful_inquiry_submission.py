import requests
import re

BASE_URL = "http://localhost:3000/api/contact"
TIMEOUT = 30

def test_post_api_contact_successful_inquiry_submission():
    # Valid Korean phone number pattern (010-XXXX-XXXX)
    valid_phone = "010-1234-5678"
    phone_pattern = r"^01[016789]-?\d{3,4}-?\d{4}$"
    assert re.match(phone_pattern, valid_phone), "Phone number does not match Korean format"

    payload = {
        "name": "Jane Doe",
        "phone": valid_phone,
        "region": "Seoul",
        "message": "I would like more information about your services."
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(BASE_URL, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {BASE_URL} failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response is not a valid JSON"

    assert "message" in resp_json, "Response JSON missing 'message' key"
    assert resp_json["message"].lower() in ("inquiry submitted successfully", "success", "ok"), \
        f"Unexpected success message: {resp_json['message']}"
    assert "data" in resp_json, "Response JSON missing 'data' key"
    data = resp_json["data"]
    # Check that returned data at least has the required fields with correct values
    assert isinstance(data, dict), "'data' field is not a dictionary"
    assert data.get("name") == payload["name"], "Returned data 'name' does not match"
    assert data.get("phone") == payload["phone"], "Returned data 'phone' does not match"
    assert data.get("region") == payload["region"], "Returned data 'region' does not match"
    # Message is optional but should match if present
    if "message" in data:
        assert data["message"] == payload["message"], "Returned data 'message' does not match"

test_post_api_contact_successful_inquiry_submission()