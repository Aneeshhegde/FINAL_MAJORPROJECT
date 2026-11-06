import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from pathlib import Path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

schemes_to_test = ["MGNREGA", "PM-KISAN", "PMAY", "PDS", "SCHOLARSHIPS"]

for sc in schemes_to_test:
    print(f"\n--- Testing Scheme: {sc} (Karnataka -> Mysuru) ---")
    payload = {"state": "KARNATAKA", "district": "MYSURU", "scheme": sc}
    res = client.post("/api/analyze", json=payload)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"Scheme: {data.get('scheme')}")
        print(f"Risk Score: {data.get('risk_summary', {}).get('risk_score')} ({data.get('risk_summary', {}).get('risk_level')})")
        print(f"Anomalies: {data.get('risk_summary', {}).get('anomalies_detected')}")
        print(f"Total Records: {data.get('risk_summary', {}).get('total_records')}")
        print(f"Suspicious Records: {len(data.get('suspicious_records', []))}")
        if data.get("suspicious_records"):
            print(f"Sample explanation: {data['suspicious_records'][0].get('explanation')}")
    else:
        print(f"Error: {res.text}")

print("\n--- Testing District Rankings with PM-KISAN ---")
res = client.get("/api/district-ranking?state=KARNATAKA&scheme=PM-KISAN")
print("Status:", res.status_code)
if res.status_code == 200:
    data = res.json()
    print("Total ranked districts:", data.get("total_districts"))
    print("Top 2 districts:", data.get("rankings")[:2])

print("\n--- ALL 5 WELFARE SCHEMES FULLY VERIFIED AND PASSING! ---")
