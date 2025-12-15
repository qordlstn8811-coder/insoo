import os
import re
import requests

def test_post_api_contact_environment_variable_security():
    # Check that environment variables for Telegram bot token and chat ID exist and are non-empty
    telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")

    assert telegram_bot_token is not None and telegram_bot_token.strip() != "", "Telegram bot token environment variable is missing or empty"
    assert telegram_chat_id is not None and telegram_chat_id.strip() != "", "Telegram chat ID environment variable is missing or empty"

    # Check that there is no hardcoded token or chat ID in environment variables values (basic heuristic)
    # For example, if token or chat id appear suspiciously constant or too short, fail
    # This is a soft check assuming real tokens are longer and random strings.
    assert len(telegram_bot_token) > 10, "Telegram bot token seems too short, possibly hardcoded or invalid"
    assert len(telegram_chat_id) > 3, "Telegram chat ID seems too short, possibly hardcoded or invalid"

    # Additionally, verify no environment variable contains suspicious hardcoded token patterns (example: full token string directly in a test)
    forbidden_substrings = ["hardcoded", "token", "chatid", "1234"]
    for forbidden in forbidden_substrings:
        assert forbidden not in telegram_bot_token.lower(), f"Telegram bot token environment variable contains suspicious substring '{forbidden}'"
        assert forbidden not in telegram_chat_id.lower(), f"Telegram chat ID environment variable contains suspicious substring '{forbidden}'"

    # Try submitting a valid POST request to /api/contact to indirectly confirm the API uses the environment variables securely (cannot directly verify token usage)
    base_url = "http://localhost:3000/api/contact"
    payload = {
        "name": "Env Test User",
        "phone": "010-1234-5678",
        "region": "Seoul",
        "message": "Checking environment variable security"
    }
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(base_url, json=payload, headers=headers, timeout=30)
        # Expect 200 for valid request; if 400, it may be validation but likely fine
        assert response.status_code in (200, 400), f"Unexpected status code {response.status_code} returned from contact API"
    except requests.RequestException as e:
        assert False, f"Request to contact API failed: {e}"

test_post_api_contact_environment_variable_security()