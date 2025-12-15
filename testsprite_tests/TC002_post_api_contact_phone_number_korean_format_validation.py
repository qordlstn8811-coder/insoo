import requests

BASE_URL = "http://localhost:3000/api/contact"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_post_api_contact_phone_number_korean_format_validation():
    # Invalid phone number formats that do not match Korean phone regex pattern "^01[016789]-?\d{3,4}-?\d{4}$"
    invalid_phones = [
        "123-4567-8901",       # Wrong prefix
        "0101234567",          # Missing dashes but too short
        "010-12345-6789",      # Too many digits in middle segment
        "019-123-456",         # Too short last segment
        "010--1234-5678",      # Double dash
        "010-1234-56789",      # Too long last segment
        "0171234567890",       # Too many digits
        "018-12-3456",         # Too short middle segment
        "010-123_4567",        # Invalid character "_"
        "010 1234 5678",       # Spaces instead of dashes
        "",                    # Empty string
        None                   # Null value
    ]

    for phone in invalid_phones:
        payload = {
            "name": "Test User",
            "phone": phone,
            "region": "Seoul"
        }
        try:
            response = requests.post(BASE_URL, headers=HEADERS, json=payload, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request failed with exception: {e}"

        # Expecting HTTP 400 Bad Request for invalid phone formats
        assert response.status_code == 400, (
            f"Expected 400 status code for phone '{phone}', got {response.status_code} with response: {response.text}"
        )

test_post_api_contact_phone_number_korean_format_validation()
