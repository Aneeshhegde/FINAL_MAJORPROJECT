import os
import requests
import json

api_key = os.getenv("DATA_GOV_IN_API_KEY", "")

if not api_key:
    print("DATA_GOV_IN_API_KEY not set in environment. Set it in .env or environment variable.")
else:
    test_url = f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key={api_key}&format=json&limit=5"
    try:
        print("Testing data.gov.in API with user key...")
        response = requests.get(test_url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:300]}")
    except Exception as e:
        print(f"Error testing API: {e}")
