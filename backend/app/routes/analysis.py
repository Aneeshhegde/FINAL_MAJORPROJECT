from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import io
import pandas as pd
import numpy as np
from datetime import datetime

from ..services.data_service import data_service
from ..services.model_service import model_service
from ..services.rules_service import rules_service
from ..services.explanation_service import explanation_service
from ..services.live_api_service import live_api_service
from ..services.scheme_service import scheme_service
from ..services.upload_service import upload_service

router = APIRouter(tags=["Analysis"])

class AnalyzeRequest(BaseModel):
    state: str
    district: str
    scheme: str = "MGNREGA"

class SyncRequest(BaseModel):
    state: str
    district: str
    scheme: str = "MGNREGA"

@router.get("/schemes")
async def get_schemes():
    """
    Returns all welfare schemes with honest implementation status.
    MGNREGA operates on real data; other schemes are simulated concept demos.
    """
    return [
        {
            "id": "MGNREGA",
            "name": "MGNREGA (real data)",
            "status": "Active",
            "description": "Rural employment wage & material expenditure anomaly screening.",
            "implemented": True,
            "badge": "Real data"
        },
        {
            "id": "PM-KISAN",
            "name": "PM-KISAN (concept demo)",
            "status": "Concept Demo",
            "description": "Direct benefit income support & duplicate disbursement screening (simulated).",
            "implemented": False,
            "badge": "Simulated"
        },
        {
            "id": "PMAY",
            "name": "PMAY (concept demo)",
            "status": "Concept Demo",
            "description": "Rural housing milestone completion & geo-tagged cost auditing (simulated).",
            "implemented": False,
            "badge": "Simulated"
        },
        {
            "id": "PDS",
            "name": "PDS (concept demo)",
            "status": "Concept Demo",
            "description": "Foodgrain allocation & fair-price shop offtake screening (simulated).",
            "implemented": False,
            "badge": "Simulated"
        },
        {
            "id": "SCHOLARSHIPS",
            "name": "NSP (concept demo)",
            "status": "Concept Demo",
            "description": "Post-matric educational subsidy duplicate enrollment screening (simulated).",
            "implemented": False,
            "badge": "Simulated"
        }
    ]

@router.get("/states")
async def get_states():
    """
    Returns all 34 States and Union Territories available in the verified dataset.
    """
    states = data_service.get_states()
    if not states:
        raise HTTPException(status_code=500, detail="Dataset not loaded or states unavailable.")
    return {"states": states, "count": len(states)}

@router.get("/districts")
async def get_districts(state: str = Query(..., description="State name")):
    """
    Returns dynamic list of districts for the given state.
    """
    districts = data_service.get_districts(state)
    if not districts:
        raise HTTPException(
            status_code=404, 
            detail=f"No districts found for state '{state}'. Please verify state name."
        )
    return {"state": state.upper(), "districts": districts, "count": len(districts)}

@router.post("/analyze")
def analyze(req: AnalyzeRequest):
    """
    Analyzes the selected State, District, and Scheme data.
    Supports MGNREGA, PM-KISAN, PMAY, PDS, and SCHOLARSHIPS.
    """
    scheme_upper = req.scheme.strip().upper()

    # Route to specialized scheme engines
    if scheme_upper == "PM-KISAN":
        return scheme_service.analyze_pm_kisan(req.state, req.district)
    elif scheme_upper == "PMAY":
        return scheme_service.analyze_pmay(req.state, req.district)
    elif scheme_upper == "PDS":
        return scheme_service.analyze_pds(req.state, req.district)
    elif scheme_upper in ["SCHOLARSHIPS", "NSP"]:
        return scheme_service.analyze_scholarships(req.state, req.district)

    # Default MGNREGA Pipeline
    # 1. Fetch district data
    df_district = data_service.get_district_records(req.state, req.district)
    if df_district.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No records found for State '{req.state}' and District '{req.district}'."
        )

    # 2. Extract final annual snapshots for honest totals (A1 bug fix)
    df_annual = data_service.extract_annual_snapshots(df_district)
    if df_annual.empty:
        df_annual = df_district.copy()

    # 3. Fetch state data for benchmark baselines
    df_state = data_service.get_state_records(req.state)
    df_state_fe = model_service.extract_features(df_state)
    state_baselines = explanation_service.compute_state_baselines(df_state_fe)

    # 4. Accurate KPI Aggregations from final snapshots
    total_expenditure = float(df_annual['Total_Exp'].sum())
    total_wages = float(df_annual['Wages'].sum())
    total_materials = float(df_annual['Material_and_skilled_Wages'].sum())
    total_admin = float(df_annual['Total_Adm_Expenditure'].sum())
    total_persondays = float(df_annual['Persondays_of_Central_Liability_so_far'].sum())

    total_works = int(df_annual['Total_No_of_Works_Takenup'].sum()) if 'Total_No_of_Works_Takenup' in df_annual.columns else 0
    completed_works = int(df_annual['Number_of_Completed_Works'].sum()) if 'Number_of_Completed_Works' in df_annual.columns else 0
    ongoing_works = int(df_annual['Number_of_Ongoing_Works'].sum()) if 'Number_of_Ongoing_Works' in df_annual.columns else 0
    total_individuals = int(df_annual['Total_Individuals_Worked'].sum()) if 'Total_Individuals_Worked' in df_annual.columns else 0
    total_households = int(df_annual['Total_Households_Worked'].sum()) if 'Total_Households_Worked' in df_annual.columns else 0
    active_job_cards = int(df_annual['Total_No_of_Active_Job_Cards'].max()) if 'Total_No_of_Active_Job_Cards' in df_annual.columns else 0
    total_workers = int(df_annual['Total_No_of_Workers'].max()) if 'Total_No_of_Workers' in df_annual.columns else total_individuals

    # Ratios on corrected totals
    district_cost_per_day = float((total_expenditure * 100000.0) / total_persondays) if total_persondays > 0 else 0.0
    district_mat_ratio = float(total_materials / total_expenditure) if total_expenditure > 0 else 0.0
    district_wage_ratio = float(total_wages / total_expenditure) if total_expenditure > 0 else 0.0
    district_admin_ratio = float(total_admin / total_expenditure) if total_expenditure > 0 else 0.0

    # 5. Evaluate District Level Risk (Aggregated vector)
    agg_row = pd.DataFrame([{
        'district_name': req.district.upper(),
        'state_name': req.state.upper(),
        'Total_Exp': total_expenditure,
        'Wages': total_wages,
        'Material_and_skilled_Wages': total_materials,
        'Total_Adm_Expenditure': total_admin,
        'Persondays_of_Central_Liability_so_far': total_persondays
    }])
    df_agg_pred = model_service.predict(agg_row)
    df_agg_analyzed = rules_service.evaluate_batch(df_agg_pred)
    risk_score = round(float(df_agg_analyzed['ml_anomaly_score'].iloc[0]), 1)
    risk_level = str(df_agg_analyzed['risk_level'].iloc[0])

    # 6. Evaluate Annual Snapshots
    df_annual_pred = model_service.predict(df_annual)
    df_annual_analyzed = rules_service.evaluate_batch(df_annual_pred)

    yearly_trends = []
    for _, row in df_annual_analyzed.iterrows():
        yearly_trends.append({
            "year": str(row.get('fin_year', '')),
            "total_records": 1,
            "anomalies": int(row.get('ml_flag', 0) == 1),
            "anomaly_rate": 100.0 if row.get('ml_flag', 0) == 1 else 0.0,
            "expenditure_in_lakhs": round(float(row.get('Total_Exp', 0.0)), 2),
            "persondays": int(row.get('Persondays_of_Central_Liability_so_far', 0)),
            "cost_per_day": round(float(row.get('cost_per_day', 0.0)), 2),
            "material_ratio": round(float(row.get('material_ratio', 0.0)), 3),
            "admin_ratio": round(float(row.get('admin_ratio', 0.0)), 3),
            "wage_ratio": round(float(row.get('wage_ratio', 0.0)), 3),
            "avg_risk_score": round(float(row.get('ml_anomaly_score', 0.0)), 1),
            "risk_level": str(row.get('risk_level', 'LOW')),
            "is_anomaly": bool(row.get('ml_flag', 0) == 1),
            "rule_violated": bool(row.get('rule_flag', 0) == 1),
        })
    yearly_trends.sort(key=lambda x: x['year'])

    # 7. Snapshot-level screening for advanced view
    df_ml = model_service.predict(df_district)
    df_analyzed = rules_service.evaluate_batch(df_ml)

    total_snapshots = len(df_analyzed)
    raw_anomalies_count = int((df_analyzed['ml_flag'] == 1).sum())
    raw_rules_count = int((df_analyzed['rule_flag'] == 1).sum())
    raw_high_risk = int(df_analyzed['risk_level'].isin(['HIGH', 'CRITICAL']).sum())
    raw_anomaly_rate = round((raw_anomalies_count / total_snapshots * 100), 2) if total_snapshots > 0 else 0.0

    # Annual anomalies counts
    annual_anomalies_count = int((df_annual_analyzed['ml_flag'] == 1).sum())
    annual_rules_count = int((df_annual_analyzed['rule_flag'] == 1).sum())
    annual_high_risk = int(df_annual_analyzed['risk_level'].isin(['HIGH', 'CRITICAL']).sum())
    annual_anomaly_rate = round((annual_anomalies_count / len(df_annual_analyzed) * 100), 2) if len(df_annual_analyzed) > 0 else 0.0

    # Risk distributions (district-year view)
    risk_dist = df_annual_analyzed['risk_level'].value_counts().to_dict()
    risk_distribution = {
        "LOW": int(risk_dist.get("LOW", 0)),
        "MEDIUM": int(risk_dist.get("MEDIUM", 0)),
        "HIGH": int(risk_dist.get("HIGH", 0)),
        "CRITICAL": int(risk_dist.get("CRITICAL", 0))
    }

    detection_methods = {
        "ml_only": int(((df_annual_analyzed['ml_flag'] == 1) & (df_annual_analyzed['rule_flag'] == 0)).sum()),
        "rules_only": int(((df_annual_analyzed['ml_flag'] == 0) & (df_annual_analyzed['rule_flag'] == 1)).sum()),
        "both_flagged": int(((df_annual_analyzed['ml_flag'] == 1) & (df_annual_analyzed['rule_flag'] == 1)).sum()),
        "clean_records": int(((df_annual_analyzed['ml_flag'] == 0) & (df_annual_analyzed['rule_flag'] == 0)).sum())
    }

    # 8. Comparative District vs State Analytics
    state_avg_cost_day = state_baselines.get('cost_per_day', {}).get('mean', district_cost_per_day)
    state_avg_mat_ratio = state_baselines.get('material_ratio', {}).get('mean', district_mat_ratio)
    state_avg_wage_ratio = state_baselines.get('wage_ratio', {}).get('mean', district_wage_ratio)
    state_avg_admin_ratio = state_baselines.get('admin_ratio', {}).get('mean', district_admin_ratio)

    def calc_dev(dist_val, st_val):
        if st_val == 0:
            return 0.0
        return round(((dist_val - st_val) / st_val) * 100, 1)

    comparative_analytics = [
        {
            "metric": "Cost per Person-Day (₹)",
            "district_value": round(district_cost_per_day, 1),
            "state_average": round(state_avg_cost_day, 1),
            "deviation_pct": calc_dev(district_cost_per_day, state_avg_cost_day),
            "status": "High" if district_cost_per_day > 450 else "Normal"
        },
        {
            "metric": "Material Expenditure Ratio",
            "district_value": f"{district_mat_ratio:.1%}",
            "state_average": f"{state_avg_mat_ratio:.1%}",
            "deviation_pct": calc_dev(district_mat_ratio, state_avg_mat_ratio),
            "status": "Violation" if district_mat_ratio > 0.40 else "Compliant"
        },
        {
            "metric": "Labor Wage Ratio",
            "district_value": f"{district_wage_ratio:.1%}",
            "state_average": f"{state_avg_wage_ratio:.1%}",
            "deviation_pct": calc_dev(district_wage_ratio, state_avg_wage_ratio),
            "status": "Warning" if district_wage_ratio < 0.60 else "Compliant"
        },
        {
            "metric": "Administrative Overhead Ratio",
            "district_value": f"{district_admin_ratio:.1%}",
            "state_average": f"{state_avg_admin_ratio:.1%}",
            "deviation_pct": calc_dev(district_admin_ratio, state_avg_admin_ratio),
            "status": "Excessive" if district_admin_ratio > 0.06 else "Normal"
        }
    ]

    # 9. Top Flagged Snapshots with Explanations (for advanced view)
    suspicious_df = df_analyzed[df_analyzed['ml_flag'] == 1].sort_values(
        by='ml_anomaly_score', ascending=False
    ).head(100)

    if suspicious_df.empty:
        suspicious_df = df_analyzed.sort_values(by='ml_anomaly_score', ascending=False).head(50)

    records_payload = []
    for idx, row in suspicious_df.iterrows():
        explanation = explanation_service.generate_record_explanation(row, state_baselines)
        dist_code = str(row.get('district_code', 'DIST'))
        masked_id = f"REC-MGN-{dist_code[-3:]}-{idx % 10000:04d}"

        records_payload.append({
            "record_id": masked_id,
            "financial_year": str(row.get('fin_year', 'N/A')),
            "month": str(row.get('month', 'N/A')),
            "state": req.state.upper(),
            "district": req.district.upper(),
            "total_exp": round(float(row.get('Total_Exp', 0.0)), 2),
            "wages": round(float(row.get('Wages', 0.0)), 2),
            "material_exp": round(float(row.get('Material_and_skilled_Wages', 0.0)), 2),
            "admin_exp": round(float(row.get('Total_Adm_Expenditure', 0.0)), 2),
            "persondays": int(row.get('Persondays_of_Central_Liability_so_far', 0)),
            "material_ratio": round(float(row.get('material_ratio', 0.0)), 3),
            "wage_ratio": round(float(row.get('wage_ratio', 0.0)), 3),
            "cost_per_day": round(float(row.get('cost_per_day', 0.0)), 1),
            "ml_anomaly_score": round(float(row.get('ml_anomaly_score', 0.0)), 1),
            "risk_level": str(row.get('risk_level', 'LOW')),
            "is_anomaly": bool(row.get('ml_flag', 0) == 1),
            "rule_violated": bool(row.get('rule_flag', 0) == 1),
            "explanation": explanation['summary'],
            "detailed_reasons": explanation['detailed_reasons'],
            "key_drivers": explanation['key_drivers']
        })

    # Norm status determination
    mat_status = "over" if district_mat_ratio > 0.40 else "near" if district_mat_ratio > 0.38 else "within"
    adm_status = "over" if district_admin_ratio > 0.06 else "near" if district_admin_ratio > 0.054 else "within"
    cost_status = "over" if district_cost_per_day > 500 else "near" if district_cost_per_day > 450 else "within"

    norm_within = (mat_status == "within" and adm_status == "within" and cost_status != "over")
    norm_text = "within norms" if norm_within else "flagged for review"
    plain_summary = f"Material share {district_mat_ratio*100:.1f}% (limit 40%), admin share {district_admin_ratio*100:.1f}% (limit 6%), cost ₹{district_cost_per_day:.2f} per personday — {norm_text}"

    return {
        "scheme": "MGNREGA",
        "state": req.state.upper(),
        "district": req.district.upper(),
        "timestamp": datetime.now().isoformat(),
        "period_label": "FY 2018-19 to 2025-26 (2025-26 up to Feb)",
        "snapshot_count_label": f"{total_snapshots} snapshots ({len(df_annual)} financial years)",
        "assessment": "screening result — field verification required",
        "plain_summary": plain_summary,
        "norm_checks": {
            "material": {
                "label": "Material Share",
                "value_pct": round(district_mat_ratio * 100, 1),
                "limit_pct": 40.0,
                "status": mat_status
            },
            "admin": {
                "label": "Admin Share",
                "value_pct": round(district_admin_ratio * 100, 1),
                "limit_pct": 6.0,
                "status": adm_status
            },
            "cost_per_day": {
                "label": "Cost per Personday",
                "value_rs": round(district_cost_per_day, 2),
                "limit_rs": 450.0,
                "breach_rs": 500.0,
                "status": cost_status
            }
        },
        "risk_summary": {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "total_records": len(df_annual),
            "anomalies_detected": annual_anomalies_count,
            "anomaly_rate": annual_anomaly_rate,
            "rules_violated_count": annual_rules_count,
            "high_risk_records": annual_high_risk,
            "raw_total_snapshots": total_snapshots,
            "raw_anomalies_detected": raw_anomalies_count,
            "raw_anomaly_rate": raw_anomaly_rate
        },
        "kpis": {
            "total_expenditure_lakhs": round(total_expenditure, 2),
            "total_expenditure_cr": round(total_expenditure / 100.0, 2),
            "total_wages_lakhs": round(total_wages, 2),
            "total_material_lakhs": round(total_materials, 2),
            "total_admin_lakhs": round(total_admin, 2),
            "total_persondays": total_persondays,
            "total_workers": total_workers,
            "active_job_cards": active_job_cards,
            "total_works": total_works,
            "completed_works": completed_works,
            "ongoing_works": ongoing_works,
            "cost_per_day": round(district_cost_per_day, 2),
            "material_ratio": round(district_mat_ratio, 3),
            "admin_ratio": round(district_admin_ratio, 3),
            "wage_ratio": round(district_wage_ratio, 3),
            "period": "FY 2018-19 to 2025-26 (2025-26 up to Feb)"
        },
        "risk_distribution": risk_distribution,
        "detection_methods": detection_methods,
        "historical_trends": yearly_trends,
        "comparative_analytics": comparative_analytics,
        "flagged_snapshots": records_payload,
        "suspicious_records": records_payload,
        "disclaimer": "A flag is not proof of fraud. It means: check this first. Decisions stay with human auditors."
    }

@router.get("/district-ranking")
def get_district_ranking(
    state: str = Query(..., description="State name"),
    scheme: str = Query("MGNREGA", description="Scheme name"),
    aggregation: str = Query("district", description="district (default, ratio-of-sums per district_code+fin_year) or record")
):
    """
    Ranks all districts in a state by their anomaly risk score and expenditure norm deviations.
    Defaults to corrected district-year ratio-of-sums view (aggregation='district').
    """
    df_state = data_service.get_state_records(state)
    if df_state.empty:
        raise HTTPException(status_code=404, detail=f"No records found for state '{state}'.")

    scheme_val = getattr(scheme, 'default', scheme) or "MGNREGA"
    agg_val = getattr(aggregation, 'default', aggregation) or "district"
    scheme_str = str(scheme_val).strip().upper()
    agg_str = str(agg_val).strip().lower()

    if scheme_str in ["PM-KISAN", "PMAY", "PDS", "SCHOLARSHIPS", "NSP"]:
        rankings = []
        for dist_name in sorted([d for d in df_state['district_name'].dropna().unique() if d]):
            if scheme_str == "PM-KISAN":
                res = scheme_service.analyze_pm_kisan(state, dist_name)
            elif scheme_str == "PMAY":
                res = scheme_service.analyze_pmay(state, dist_name)
            elif scheme_str == "PDS":
                res = scheme_service.analyze_pds(state, dist_name)
            else:
                res = scheme_service.analyze_scholarships(state, dist_name)
            rankings.append({
                "district": str(dist_name),
                "risk_score": res['risk_summary']['risk_score'],
                "risk_level": res['risk_summary']['risk_level'],
                "total_records": res['risk_summary']['total_records'],
                "anomalies": res['risk_summary']['anomalies_detected'],
                "anomaly_rate": res['risk_summary']['anomaly_rate'],
                "total_expenditure_lakhs": res['kpis']['total_expenditure_lakhs'],
                "total_expenditure_cr": round(res['kpis']['total_expenditure_lakhs'] / 100.0, 2),
                "total_persondays": 0.0,
                "material_ratio": 0.0,
                "admin_ratio": 0.0,
                "cost_per_day": 0.0,
                "top_driver": "Simulated scenario screening",
                "period": "FY 2018-19 to 2025-26 (2025-26 up to Feb)"
            })
    else:
        # MGNREGA
        if agg_str == "district":
            snaps_state = data_service.extract_annual_snapshots(df_state)
            dist_groups = snaps_state.groupby('district_name', observed=True)
            dist_data = []
            for dist_name, snaps in dist_groups:
                if snaps.empty:
                    continue
                sum_tot = float(snaps['Total_Exp'].sum())
                if sum_tot <= 0:
                    continue
                sum_mat = float(snaps['Material_and_skilled_Wages'].sum())
                sum_adm = float(snaps['Total_Adm_Expenditure'].sum())
                sum_wag = float(snaps['Wages'].sum())
                sum_pdays = float(snaps['Persondays_of_Central_Liability_so_far'].sum())

                mat_ratio = round(float(sum_mat / sum_tot), 3) if sum_tot > 0 else 0.0
                adm_ratio = round(float(sum_adm / sum_tot), 3) if sum_tot > 0 else 0.0
                cost_pday = round(float(sum_tot * 100000.0 / sum_pdays), 1) if sum_pdays > 0 else 0.0

                if mat_ratio > 0.40:
                    top_driver = f"Material share {mat_ratio*100:.1f}% (statutory limit 40%)"
                elif adm_ratio > 0.06:
                    top_driver = f"Admin share {adm_ratio*100:.1f}% (MoRD limit 6%)"
                elif cost_pday > 500:
                    top_driver = f"Cost ₹{cost_pday:.0f}/personday (norm ₹450-₹500)"
                elif cost_pday > 450:
                    top_driver = f"Elevated cost ₹{cost_pday:.0f}/personday (norm ₹450)"
                else:
                    top_driver = "Within statutory & operational norms"

                dist_data.append({
                    'district': str(dist_name),
                    'Total_Exp': sum_tot,
                    'Material_and_skilled_Wages': sum_mat,
                    'Total_Adm_Expenditure': sum_adm,
                    'Wages': sum_wag,
                    'Persondays_of_Central_Liability_so_far': sum_pdays,
                    'total_records': len(snaps),
                    'material_ratio': mat_ratio,
                    'admin_ratio': adm_ratio,
                    'wage_ratio': round(float(sum_wag / sum_tot), 3) if sum_tot > 0 else 0.0,
                    'cost_per_day': cost_pday,
                    'top_driver': top_driver
                })

            if dist_data:
                df_all_dist = pd.DataFrame(dist_data)
                df_preds = model_service.predict(df_all_dist)
                rankings = []
                for idx, row in df_preds.iterrows():
                    score = round(float(row['ml_anomaly_score']), 1)
                    risk_lvl = str(row['risk_level'])
                    anomalies = int(row['ml_flag'] == 1)
                    total = int(dist_data[idx]['total_records'])
                    total_exp = float(dist_data[idx]['Total_Exp'])
                    sum_pdays = float(dist_data[idx]['Persondays_of_Central_Liability_so_far'])
                    rankings.append({
                        "district": dist_data[idx]['district'],
                        "risk_score": score,
                        "risk_level": risk_lvl,
                        "total_records": total,
                        "anomalies": anomalies,
                        "anomaly_rate": round(anomalies / total * 100, 2) if total > 0 else 0.0,
                        "total_expenditure_lakhs": round(total_exp, 2),
                        "total_expenditure_cr": round(total_exp / 100.0, 2),
                        "total_persondays": sum_pdays,
                        "material_ratio": dist_data[idx]['material_ratio'],
                        "admin_ratio": dist_data[idx]['admin_ratio'],
                        "cost_per_day": dist_data[idx]['cost_per_day'],
                        "top_driver": dist_data[idx]['top_driver'],
                        "period": "FY 2018-19 to 2025-26 (2025-26 up to Feb)"
                    })
            else:
                rankings = []
        else:
            rankings = []
            for dist_name, group in df_state.groupby('district_name', observed=True):
                if len(group) == 0:
                    continue
                df_pred = model_service.predict(group)
                score, risk_lvl = model_service.calculate_overall_risk(df_pred)
                anomalies = int((df_pred['ml_flag'] == 1).sum())
                total = len(group)
                total_exp = float(group['Total_Exp'].sum())
                sum_pdays = float(pd.to_numeric(group['Persondays_of_Central_Liability_so_far'], errors='coerce').sum())
                mat_ratio = round(float(group['Material_and_skilled_Wages'].sum() / total_exp), 3) if total_exp > 0 else 0.0
                adm_ratio = round(float(group['Total_Adm_Expenditure'].sum() / total_exp), 3) if total_exp > 0 else 0.0
                cost_pday = round(float(total_exp * 100000.0 / sum_pdays), 1) if sum_pdays > 0 else 0.0
                rankings.append({
                    "district": str(dist_name),
                    "risk_score": score,
                    "risk_level": risk_lvl,
                    "total_records": total,
                    "anomalies": anomalies,
                    "anomaly_rate": round(anomalies / total * 100, 2) if total > 0 else 0.0,
                    "total_expenditure_lakhs": round(total_exp, 2),
                    "total_expenditure_cr": round(total_exp / 100.0, 2),
                    "total_persondays": sum_pdays,
                    "material_ratio": mat_ratio,
                    "admin_ratio": adm_ratio,
                    "cost_per_day": cost_pday,
                    "top_driver": "Snapshot-level evaluation",
                    "period": "FY 2018-19 to 2025-26 (2025-26 up to Feb)"
                })

    rankings.sort(key=lambda x: (x['risk_score'], x['anomalies']), reverse=True)
    for idx, item in enumerate(rankings):
        item['rank'] = idx + 1

    return {
        "state": state.upper(),
        "scheme": scheme.upper(),
        "total_districts": len(rankings),
        "rankings": rankings
    }

@router.get("/state-overview")
def get_state_overview(
    state: str = Query(..., description="State name"),
    scheme: str = Query("MGNREGA", description="Scheme name")
):
    df_state = data_service.get_state_records(state)
    if df_state.empty:
        raise HTTPException(status_code=404, detail=f"No records found for state '{state}'.")

    ranking_res = get_district_ranking(state, scheme, aggregation="district")
    rankings = ranking_res['rankings']

    total_records = sum(r['total_records'] for r in rankings)
    total_anomalies = sum(r['anomalies'] for r in rankings)
    avg_score = round(sum(r['risk_score'] for r in rankings) / len(rankings), 1) if rankings else 0.0
    
    state_risk = "CRITICAL" if avg_score >= 75 else "HIGH" if avg_score >= 55 else "MEDIUM" if avg_score >= 35 else "LOW"
    total_exp_lakhs = round(sum(r['total_expenditure_lakhs'] for r in rankings), 2)

    return {
        "state": state.upper(),
        "scheme": scheme.upper(),
        "total_records": total_records,
        "total_anomalies": total_anomalies,
        "state_risk_score": avg_score,
        "state_risk_level": state_risk,
        "total_expenditure_lakhs": total_exp_lakhs,
        "total_expenditure_cr": round(total_exp_lakhs / 100.0, 2),
        "total_persondays": float(sum(r.get('total_persondays', 0) for r in rankings)),
        "period": "FY 2018-19 to 2025-26 (2025-26 up to Feb)",
        "highest_risk_districts": rankings[:5],
        "lowest_risk_districts": rankings[-5:] if len(rankings) >= 5 else rankings
    }

@router.post("/sync/live")
async def sync_live(req: SyncRequest):
    result = live_api_service.fetch_live_district_data(req.state, req.district)
    return result

@router.post("/upload-analyze")
def upload_analyze(file: UploadFile = File(...)):
    """
    Accepts multipart CSV upload, runs schema & value validation,
    runs production Isolation Forest + Rules scoring, generates plain-language
    explanations, district aggregations, and summary KPIs.
    """
    try:
        content = file.file.read()
        df_raw = pd.read_csv(io.BytesIO(content))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    df_clean, validation = upload_service.validate_and_clean_data(df_raw)
    return upload_service.analyze_dataset(df_clean, validation)

@router.post("/compare-answer-key")
def compare_answer_key(
    answer_key: UploadFile = File(...),
    data_file: Optional[UploadFile] = File(None)
):
    """
    Compares the analyzed dataset with ground-truth answer key.
    Returns 2x2 confusion matrix (TP, FP, FN, TN, precision, recall, F1, accuracy),
    pattern-level stats, and 9 planted districts breakdown.
    """
    try:
        key_content = answer_key.file.read()
        df_key = pd.read_csv(io.BytesIO(key_content))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse answer key CSV: {str(e)}")

    analysis_data = None
    if data_file is not None:
        try:
            data_content = data_file.file.read()
            df_data = pd.read_csv(io.BytesIO(data_content))
            df_clean, validation = upload_service.validate_and_clean_data(df_data)
            analysis_data = upload_service.analyze_dataset(df_clean, validation)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process data file: {str(e)}")

    return upload_service.compare_with_answer_key(df_key, analysis_data)

