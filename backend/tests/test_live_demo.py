import sys
import io
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import pytest
from starlette.datastructures import UploadFile
from fastapi import HTTPException
from backend.app.routes.analysis import upload_analyze, compare_answer_key

DEMO_DIR = Path(__file__).resolve().parent.parent / "data" / "demo"

def test_upload_analyze_synthetic_demo():
    csv_path = DEMO_DIR / "demo_upload_SYNTHETIC_v2.csv"
    assert csv_path.exists(), f"Demo file missing: {csv_path}"

    with open(csv_path, "rb") as f:
        content = f.read()

    uf = UploadFile(filename="demo_upload_SYNTHETIC_v2.csv", file=io.BytesIO(content))
    data = upload_analyze(uf)

    assert data["is_synthetic"] is True

    # Validation report
    val = data["validation"]
    assert val["rows_received"] == 360
    assert val["rows_kept"] == 360
    assert val["duplicates_removed"] == 0
    assert val["total_exp_lte_zero"] == 0
    assert val["persondays_lte_zero"] == 0

    # KPIs
    kpis = data["kpis"]
    assert kpis["records"] == 360
    assert kpis["flagged_records"] == 23
    assert kpis["districts_flagged"] == 7

    # Check top 7 districts
    districts = data["districts"]
    assert len(districts) == 30

    expected_top_7 = [
        ("NORTH DISTRICT 03", 58.7, "HIGH", 5),
        ("EAST DISTRICT 10", 48.0, "MEDIUM", 3),
        ("NORTH DISTRICT 07", 45.2, "MEDIUM", 4),
        ("SOUTH DISTRICT 02", 42.4, "MEDIUM", 3),
        ("EAST DISTRICT 01", 42.0, "MEDIUM", 3),
        ("EAST DISTRICT 04", 40.0, "MEDIUM", 3),
        ("SOUTH DISTRICT 05", 39.2, "MEDIUM", 2),
    ]

    for idx, (dist_name, exp_score, exp_level, exp_fl_months) in enumerate(expected_top_7):
        d = districts[idx]
        assert d["district_name"] == dist_name
        assert d["risk_score"] == exp_score
        assert d["risk_level"] == exp_level
        assert d["months_flagged"] == exp_fl_months
        assert d["rank"] == idx + 1

    # All remaining 23 districts have 0 flagged months and score < 35.0 (LOW)
    for d in districts[7:]:
        assert d["months_flagged"] == 0
        assert d["risk_score"] < 35.0
        assert d["risk_level"] == "LOW"

    # Check that NORTH DISTRICT 03 in Nov is flagged
    nd03_records = [r for r in data["records"] if r["district_name"] == "NORTH DISTRICT 03" and r["month"] == "Nov"]
    assert len(nd03_records) == 1
    assert nd03_records[0]["flagged"] is True
    assert nd03_records[0]["cost_per_day"] >= 500.0


def test_compare_answer_key():
    key_path = DEMO_DIR / "demo_answer_key_v2.csv"
    assert key_path.exists(), f"Answer key file missing: {key_path}"

    with open(key_path, "rb") as f:
        content = f.read()

    uf = UploadFile(filename="demo_answer_key_v2.csv", file=io.BytesIO(content))
    data = compare_answer_key(uf, None)

    cm = data["confusion_matrix"]
    assert cm["tp"] == 23
    assert cm["fp"] == 0
    assert cm["fn"] == 10
    assert cm["tn"] == 327

    patterns = data["patterns"]
    assert patterns["ghost_workers"]["caught"] == 8
    assert patterns["ghost_workers"]["total"] == 8
    assert patterns["material_inflation"]["caught"] == 7
    assert patterns["material_inflation"]["total"] == 7
    assert patterns["admin_padding"]["caught"] == 3
    assert patterns["admin_padding"]["total"] == 3
    assert patterns["multi_violation"]["caught"] == 3
    assert patterns["multi_violation"]["total"] == 3
    assert patterns["year_end_spike"]["caught"] == 2
    assert patterns["year_end_spike"]["total"] == 2
    assert patterns["subtle_below_threshold"]["caught"] == 0
    assert patterns["subtle_below_threshold"]["total"] == 4
    assert patterns["ratio_neutral_fake_jobcards"]["caught"] == 0
    assert patterns["ratio_neutral_fake_jobcards"]["total"] == 6

    # Planted districts: 9 total, 7 caught, 2 missed
    planted = data["planted_districts"]
    assert len(planted) == 9
    caught_districts = [p for p in planted if p["caught"]]
    missed_districts = [p for p in planted if not p["caught"]]
    assert len(caught_districts) == 7
    assert len(missed_districts) == 2

    missed_names = {m["district_name"] for m in missed_districts}
    assert missed_names == {"NORTH DISTRICT 09", "SOUTH DISTRICT 08"}

    # Check that plain explanations exist for missed districts
    for m in missed_districts:
        assert len(m["explanation_note"]) > 10


def test_upload_messy_bad_rows():
    csv_path = DEMO_DIR / "demo_messy_bad_rows.csv"
    assert csv_path.exists()

    with open(csv_path, "rb") as f:
        content = f.read()

    uf = UploadFile(filename="demo_messy_bad_rows.csv", file=io.BytesIO(content))
    data = upload_analyze(uf)
    val = data["validation"]

    assert val["rows_received"] == 43
    assert val["duplicates_removed"] == 3
    assert val["total_exp_lte_zero"] == 5
    assert val["persondays_lte_zero"] == 4
    assert val["non_numeric_wages"] == 3
    assert val["rows_kept"] == 28


def test_upload_missing_column():
    csv_path = DEMO_DIR / "demo_messy_missing_column.csv"
    assert csv_path.exists()

    with open(csv_path, "rb") as f:
        content = f.read()

    uf = UploadFile(filename="demo_messy_missing_column.csv", file=io.BytesIO(content))
    with pytest.raises(HTTPException) as excinfo:
        upload_analyze(uf)

    assert excinfo.value.status_code == 400
    detail = excinfo.value.detail
    assert detail["error"] == "missing_columns"
    assert "Total_Adm_Expenditure" in detail["missing"]
