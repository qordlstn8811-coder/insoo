import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3000/api/contact"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_post_contact_form_submission_validation():
    required_fields = ["name", "phone", "region"]
    # Valid data template
    valid_data = {
        "name": "Test User",
        "phone": "010-1234-5678",
        "region": "Seoul",
        "message": "This is a test message."
    }

    try:
        # Test with all required fields present - should succeed (status != 400)
        response = requests.post(BASE_URL, json=valid_data, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 200 or response.status_code != 400, "Valid request shouldn't return 400"

        # For each required field, omit it and check for 400 response
        for field in required_fields:
            test_data = valid_data.copy()
            test_data.pop(field)
            resp = requests.post(BASE_URL, json=test_data, headers=HEADERS, timeout=TIMEOUT)
            assert resp.status_code == 400, f"Request missing required field '{field}' should return 400"

        # Test for invalid phone format (missing digits, invalid format) returns 400
        invalid_phones = [
            "012-3456-7890",  # invalid prefix
            "0101234567",     # too short
            "abcdefghijk",    # non numeric
            "010-12-345678",  # wrong segment lengths
            "010-12345-678",  # wrong segment lengths
        ]
        for phone in invalid_phones:
            test_data = valid_data.copy()
            test_data["phone"] = phone
            resp = requests.post(BASE_URL, json=test_data, headers=HEADERS, timeout=TIMEOUT)
            assert resp.status_code == 400, f"Request with invalid phone '{phone}' should return 400"

    except RequestException as e:
        raise AssertionError(f"Request failed: {e}")

test_post_contact_form_submission_validation()