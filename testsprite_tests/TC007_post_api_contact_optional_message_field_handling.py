import requests

BASE_URL = "http://localhost:3000/api/contact"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_post_api_contact_optional_message_field_handling():
    # Data with optional message field
    payload_with_message = {
        "name": "Kim Minsoo",
        "phone": "010-1234-5678",
        "region": "Seoul",
        "message": "I would like more information about your services."
    }

    # Data without optional message field
    payload_without_message = {
        "name": "Lee Jieun",
        "phone": "010-8765-4321",
        "region": "Busan"
    }

    # Test with message field
    response_with_message = requests.post(
        BASE_URL,
        json=payload_with_message,
        headers=HEADERS,
        timeout=TIMEOUT
    )
    assert response_with_message.status_code == 200, f"Expected 200 OK, got {response_with_message.status_code}"
    json_resp_with_message = response_with_message.json()
    assert "message" in json_resp_with_message and isinstance(json_resp_with_message["message"], str)
    assert "data" in json_resp_with_message and isinstance(json_resp_with_message["data"], dict)

    # Test without message field
    response_without_message = requests.post(
        BASE_URL,
        json=payload_without_message,
        headers=HEADERS,
        timeout=TIMEOUT
    )
    assert response_without_message.status_code == 200, f"Expected 200 OK, got {response_without_message.status_code}"
    json_resp_without_message = response_without_message.json()
    assert "message" in json_resp_without_message and isinstance(json_resp_without_message["message"], str)
    assert "data" in json_resp_without_message and isinstance(json_resp_without_message["data"], dict)

test_post_api_contact_optional_message_field_handling()
