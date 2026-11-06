import sys
import io
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

print("[1] Importing app & TestClient...")
from backend.app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)
print("[2] Created TestClient.")

csv_path = root_dir / "backend" / "data" / "demo" / "demo_upload_SYNTHETIC_v2.csv"
content = csv_path.read_bytes()

print("[3] Sending POST /api/upload-analyze...")
resp = client.post(
    "/api/upload-analyze",
    files={"file": ("demo_upload_SYNTHETIC_v2.csv", content, "text/csv")}
)
print("[4] Response status:", resp.status_code)
print("[5] Response json keys:", resp.json().keys() if resp.status_code == 200 else resp.text)

