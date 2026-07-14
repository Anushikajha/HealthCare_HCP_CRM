import os
import sys
import datetime

# Add the parent directories to sys.path so app imports work
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BACKEND_ROOT not in sys.path:
    sys.path.append(BACKEND_ROOT)

from app.agent.tools import parse_date


def test_date_parser():
    print("Running date parser verification tests...")
    today = datetime.date.today()
    
    # Assert today
    parsed_today = parse_date("today")
    print(f"Input 'today' -> Result: {parsed_today}")
    assert parsed_today == today
    
    # Assert yesterday
    parsed_yesterday = parse_date("yesterday")
    yesterday = today - datetime.timedelta(days=1)
    print(f"Input 'yesterday' -> Result: {parsed_yesterday}")
    assert parsed_yesterday == yesterday
    
    # Assert ISO format
    parsed_iso = parse_date("2026-07-13")
    print(f"Input '2026-07-13' -> Result: {parsed_iso}")
    assert parsed_iso == datetime.date(2026, 7, 13)

    print("SUCCESS: Date parser works correctly.")


def test_fallback_response_without_groq_key():
    from app.agent.graph import build_fallback_response

    response = build_fallback_response("Log a meeting with Dr. Sharma at Mayo Clinic about Glycomet")
    print("Fallback response:", response)
    assert "offline" in response.lower() or "dr. sharma" in response.lower()


def test_resolve_model_for_supported_groq_model():
    from app.agent.tools import resolve_model_name

    assert resolve_model_name("gemma2-9b-it") == "llama-3.3-70b-versatile"
    assert resolve_model_name("llama-3.3-70b-versatile") == "llama-3.3-70b-versatile"


if __name__ == "__main__":
    try:
        test_date_parser()
        test_fallback_response_without_groq_key()
        test_resolve_model_for_supported_groq_model()
        print("SUCCESS: Verification tests completed successfully!")
    except AssertionError as e:
        print("ERROR: Assertion error occurred during verification:", str(e))
        sys.exit(1)
    except Exception as e:
        print("ERROR: Error running verification:", str(e))
        sys.exit(1)
