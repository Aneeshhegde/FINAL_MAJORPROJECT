import requests
import time
import subprocess
import os

# Test importing the FastAPI app and invoking routes via TestClient
from fastapi.testclient import TestClient
import sys

# Add backend to sys.path
from pathlib import Path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from app.main import app

client = TestClient(app)

print("1. Testing GET / ...")
res = client.get("/")
print("Root status:", res.status_code, res.json())

print("2. Testing GET /api/schemes ...")
res = client.get("/api/schemes")
print("Schemes:", res.status_code, len(res.json()), "schemes found")

print("3. Testing GET /api/states ...")
res = client.get("/api/states")
data = res.json()
print("States status:", res.status_code, "Count:", data.get("count"), "First 5:", data.get("states")[:5])

print("4. Testing GET /api/districts?state=KARNATAKA ...")
res = client.get("/api/districts?state=KARNATAKA")
data = res.json()
print("Districts status:", res.status_code, "Count:", data.get("count"), "Sample:", data.get("districts")[:5])

print("5. Testing POST /api/analyze with Karnataka -> Mysuru ...")
payload = {"state": "KARNATAKA", "district": "MYSURU", "scheme": "MGNREGA"}
res = client.post("/api/analyze", json=payload)
data = res.json()
print("Analyze status:", res.status_code)
print("Risk Summary:", data.get("risk_summary"))
print("KPIs:", data.get("kpis"))
print("Risk Distribution:", data.get("risk_distribution"))
print("Suspicious Records Count:", len(data.get("suspicious_records", [])))
if data.get("suspicious_records"):
    print("Sample Suspicious Record Reason:", data["suspicious_records"][0].get("explanation"))

print("6. Testing GET /api/district-ranking?state=KARNATAKA ...")
res = client.get("/api/district-ranking?state=KARNATAKA")
data = res.json()
print("Ranking status:", res.status_code, "Top 3 Districts:", data.get("rankings")[:3])

print("\n--- ALL BACKEND TEST CLIENT CHECKS PASSED! ---")
