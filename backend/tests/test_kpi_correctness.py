import pytest
import pandas as pd
from backend.app.services.data_service import data_service
from backend.app.services.model_service import model_service
from backend.app.routes.analysis import analyze, AnalyzeRequest, get_district_ranking, get_state_overview

def test_mysuru_cumulative_aggregation_kpis():
    """
    Acceptance test for MYSURU (KARNATAKA):
    Verifies that cumulative snapshot bug is resolved by taking the final snapshot
    per financial year rather than summing all raw snapshots.
    Acceptance targets:
      - Total Expenditure = ₹1,082.31 Cr (108,230.72 lakh)
      - Person-days = 23,342,507 (23.34 M)
      - 558 total snapshots across 8 financial years
      - Period label = 'FY 2018-19 to 2025-26 (2025-26 up to Feb)'
    """
    df_district = data_service.get_district_records("KARNATAKA", "MYSURU")
    assert not df_district.empty
    assert len(df_district) == 558

    df_annual = data_service.extract_annual_snapshots(df_district)
    assert len(df_annual) == 8, f"Expected 8 financial years, got {len(df_annual)}"

    tot_exp_lakhs = float(df_annual['Total_Exp'].sum())
    tot_exp_cr = round(tot_exp_lakhs / 100.0, 2)
    tot_persondays = int(df_annual['Persondays_of_Central_Liability_so_far'].sum())

    # Check exact acceptance values
    assert tot_exp_cr == 1082.31, f"Expected ₹1,082.31 Cr, got ₹{tot_exp_cr} Cr"
    assert tot_persondays == 23342507, f"Expected 23,342,507 persondays, got {tot_persondays}"

def test_analyze_endpoint_mysuru():
    """
    Verifies /api/analyze endpoint response structure and KPI values for MYSURU.
    """
    req = AnalyzeRequest(state="KARNATAKA", district="MYSURU", scheme="MGNREGA")
    resp = analyze(req)

    assert resp["scheme"] == "MGNREGA"
    assert resp["state"] == "KARNATAKA"
    assert resp["district"] == "MYSURU"

    kpis = resp["kpis"]
    assert kpis["total_expenditure_cr"] == 1082.31
    assert kpis["total_persondays"] == 23342507
    assert kpis["period"] == "FY 2018-19 to 2025-26 (2025-26 up to Feb)"
    assert resp["period_label"] == "FY 2018-19 to 2025-26 (2025-26 up to Feb)"
    assert resp["snapshot_count_label"] == "558 snapshots (8 financial years)"
    assert resp["assessment"] == "screening result — field verification required"
    assert "Material share 33.7%" in resp["plain_summary"]
    assert "admin share 2.7%" in resp["plain_summary"]
    assert "cost ₹463.66" in resp["plain_summary"]

def test_district_ranking_default_aggregation():
    """
    Verifies /api/district-ranking defaults to district aggregation (ratio of sums).
    """
    res = get_district_ranking(state="KARNATAKA", scheme="MGNREGA")
    assert res["state"] == "KARNATAKA"
    assert res["total_districts"] > 0
    
    mysuru_items = [d for d in res["rankings"] if d["district"] == "MYSURU"]
    assert len(mysuru_items) == 1
    mysuru = mysuru_items[0]
    assert mysuru["total_expenditure_cr"] == 1082.31
    assert mysuru["total_persondays"] == 23342507
    assert mysuru["material_ratio"] == 0.337
    assert mysuru["admin_ratio"] == 0.027
