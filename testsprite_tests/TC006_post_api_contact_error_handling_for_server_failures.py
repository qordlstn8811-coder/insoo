import requests
import json

def test_post_api_contact_error_handling_for_server_failures():
    url = "http://localhost:3000/api/contact"
    headers = {
        "Content-Type": "application/json"
    }
    # Valid request payload with required fields and phone matching Korean phone format
    payload = {
        "name": "Test User",
        "phone": "010-1234-5678",
        "region": "Seoul",
        "message": "Testing server error handling"
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"

    # Assert that HTTP status code is 500 indicating a server error
    assert response.status_code == 500, f"Expected status code 500 but got {response.status_code}"

    # Attempt to parse JSON response
    try:
        resp_json = response.json()
    except json.JSONDecodeError:
        resp_json = None

    # Validate response structure and error message presence
    assert resp_json is not None, "Response did not contain valid JSON"
    assert "error" in resp_json or "message" in resp_json, "Response JSON does not contain 'error' or 'message' key"
    # The error message should be a non-empty string describing the issue
    error_msg = resp_json.get("error") or resp_json.get("message")
    assert isinstance(error_msg, str) and error_msg.strip(), "Error message is empty or not a string"

test_post_api_contact_error_handling_for_server_failures()