import requests

def test_submit_contact_inquiry_success():
    url = "http://localhost:3000/api/contact"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "name": "John Doe",
        "phone": "010-1234-5678",
        "region": "Seoul",
        "message": "This is a test inquiry."
    }
    timeout = 60  # seconds

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=timeout)
        response.raise_for_status()
        data = response.json()
        print(data)
        assert response.status_code == 200
        assert isinstance(data, dict)
        assert "message" in data and isinstance(data["message"], str)
        assert "data" in data and isinstance(data["data"], dict)
    except requests.exceptions.Timeout:
        assert False, "Request timed out"
    except requests.exceptions.HTTPError as http_err:
        assert False, f"HTTP error occurred: {http_err}"
    except Exception as err:
        assert False, f"Unexpected error occurred: {err}"


test_submit_contact_inquiry_success()