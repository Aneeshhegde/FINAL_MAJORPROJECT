from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime

from ..services.data_service import data_service
from ..services.model_service import model_service
from ..services.rules_service import rules_service
from ..services.explanation_service import explanation_service
from ..services.live_api_service import live_api_service
from ..services.scheme_service import scheme_service

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
    Returns all supported and active welfare schemes.
    """
    return [
        {
            "id": "MGNREGA",
            "name": "MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act)",
            "status": "Active",
            "description": "Rural employment wage & material expenditure anomaly detection using Isolation Forest.",
            "implemented": True
        },
        {
            "id": "PM-KISAN",
            "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            "status": "Active",
            "description": "Direct benefit income support for farmer landholding & duplicate disbursement detection.",
            "implemented": True
        },
        {
            "id": "PMAY",
            "name": "PMAY (Pradhan Mantri Awas Yojana - Gramin/Urban)",
            "status": "Active",
            "description": "Rural housing milestone completion & geo-tagged construction cost auditing.",
            "implemented": True
        },
        {
            "id": "PDS",
            "name": "PDS (Targeted Public Distribution System)",
            "status": "Active",
            "description": "Foodgrain allocation, fair-price shop offtake & ration card anomaly detection.",
            "implemented": True
        },
        {
            "id": "SCHOLARSHIPS",
            "name": "National Scholarship Portal (NSP)",
            "status": "Active",
            "description": "Post-matric and pre-matric educational subsidy fraud & ghost institute detection.",
            "implemented": True
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
async def analyze(req: AnalyzeRequest):
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

    # 2. Fetch state data for benchmark baselines
    df_state = data_service.get_state_records(req.state)
    df_state_fe = model_service.extract_features(df_state)
    state_baselines = explanation_service.compute_state_baselines(df_state_fe)

    # 3. Apply ML Model
    df_ml = model_service.predict(df_district)

    # 4. Apply Rules Engine
    df_analyzed = rules_service.evaluate_batch(df_ml)

    # 5. Compute District Risk Score & Summary
    risk_score, risk_level = model_service.calculate_overall_risk(df_analyzed)
    
    total_records = len(df_analyzed)
    anomalies_count = int((df_analyzed['ml_flag'] == 1).sum())
    rules_violated_count = int((df_analyzed['rule_flag'] == 1).sum())
    high_risk_records = int((df_analyzed['risk_level'].isin(['HIGH', 'CRITICAL'])).sum())
    anomaly_rate = round((anomalies_count / total_records * 100), 2) if total_records > 0 else 0.0

    # 6. Aggregate KPIs
    total_expenditure = float(df_analyzed['Total_Exp'].sum())
    total_wages = float(df_analyzed['Wages'].sum())
    total_materials = float(df_analyzed['Material_and_skilled_Wages'].sum())
    total_admin = float(df_analyzed['Total_Adm_Expenditure'].sum())
    total_persondays = float(df_analyzed['Persondays_of_Central_Liability_so_far'].sum())
    total_workers = int(df_analyzed['Total_No_of_Workers'].max() or df_analyzed['Total_Individuals_Worked'].sum())
    active_job_cards = int(df_analyzed['Total_No_of_Active_Job_Cards'].max() or 0)
    total_works = int(df_analyzed['Total_No_of_Works_Takenup'].max() or 0)
    completed_works = int(df_analyzed['Number_of_Completed_Works'].max() or 0)
    ongoing_works = int(df_analyzed['Number_of_Ongoing_Works'].max() or 0)

    # 7. Distributions
    risk_dist = df_analyzed['risk_level'].value_counts().to_dict()
    risk_distribution = {
        "LOW": int(risk_dist.get("LOW", 0)),
        "MEDIUM": int(risk_dist.get("MEDIUM", 0)),
        "HIGH": int(risk_dist.get("HIGH", 0)),
        "CRITICAL": int(risk_dist.get("CRITICAL", 0))
    }

    detection_methods = {
        "ml_only": int(((df_analyzed['ml_flag'] == 1) & (df_analyzed['rule_flag'] == 0)).sum()),
        "rules_only": int(((df_analyzed['ml_flag'] == 0) & (df_analyzed['rule_flag'] == 1)).sum()),
        "both_flagged": int(((df_analyzed['ml_flag'] == 1) & (df_analyzed['rule_flag'] == 1)).sum()),
        "clean_records": int(((df_analyzed['ml_flag'] == 0) & (df_analyzed['rule_flag'] == 0)).sum())
    }

    # 8. Historical Trends by Year
    yearly_trends = []
    if 'fin_year' in df_analyzed.columns:
        for year, group in df_analyzed.groupby('fin_year', observed=True):
            y_total = len(group)
            y_anomalies = int((group['ml_flag'] == 1).sum())
            y_exp = float(group['Total_Exp'].sum())
            y_avg_score = float(group['ml_anomaly_score'].mean())
            yearly_trends.append({
                "year": str(year),
                "total_records": y_total,
                "anomalies": y_anomalies,
                "anomaly_rate": round(y_anomalies / y_total * 100, 1) if y_total > 0 else 0,
                "expenditure_in_lakhs": round(y_exp, 2),
                "avg_risk_score": round(y_avg_score, 1)
            })
        yearly_trends.sort(key=lambda x: x['year'])

    # 9. Comparative District vs State Analytics
    district_cost_per_day = float(total_expenditure / total_persondays) if total_persondays > 0 else 0.0
    district_mat_ratio = float(total_materials / total_expenditure) if total_expenditure > 0 else 0.0
    district_wage_ratio = float(total_wages / total_expenditure) if total_expenditure > 0 else 0.0
    district_admin_ratio = float(total_admin / total_expenditure) if total_expenditure > 0 else 0.0

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
            "status": "Excessive" if district_admin_ratio > 0.10 else "Normal"
        }
    ]

    # 10. Prepare Top Suspicious Records with Explanations
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

    return {
        "scheme": "MGNREGA",
        "state": req.state.upper(),
        "district": req.district.upper(),
        "timestamp": datetime.now().isoformat(),
        "risk_summary": {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "total_records": total_records,
            "anomalies_detected": anomalies_count,
            "anomaly_rate": anomaly_rate,
            "rules_violated_count": rules_violated_count,
            "high_risk_records": high_risk_records
        },
        "kpis": {
            "total_expenditure_lakhs": round(total_expenditure, 2),
            "total_wages_lakhs": round(total_wages, 2),
            "total_material_lakhs": round(total_materials, 2),
            "total_admin_lakhs": round(total_admin, 2),
            "total_persondays": total_persondays,
            "total_workers": total_workers,
            "active_job_cards": active_job_cards,
            "total_works": total_works,
            "completed_works": completed_works,
            "ongoing_works": ongoing_works
        },
        "risk_distribution": risk_distribution,
        "detection_methods": detection_methods,
        "historical_trends": yearly_trends,
        "comparative_analytics": comparative_analytics,
        "suspicious_records": records_payload,
        "disclaimer": "Anomaly detection identifies statistically unusual patterns and statutory compliance deviations. Flagged records do not constitute legal proof of fraud and warrant verification by designated welfare audit authorities."
    }

@router.get("/district-ranking")
async def get_district_ranking(
    state: str = Query(..., description="State name"),
    scheme: str = Query("MGNREGA", description="Scheme name")
):
    """
    Ranks all districts in a state by their anomaly risk score and percentage of flagged records.
    """
    df_state = data_service.get_state_records(state)
    if df_state.empty:
        raise HTTPException(status_code=404, detail=f"No records found for state '{state}'.")

    rankings = []
    for dist_name, group in df_state.groupby('district_name', observed=True):
        if len(group) == 0:
            continue
        
        if scheme.upper() == "PM-KISAN":
            res = scheme_service.analyze_pm_kisan(state, dist_name)
            score = res['risk_summary']['risk_score']
            risk_lvl = res['risk_summary']['risk_level']
            anomalies = res['risk_summary']['anomalies_detected']
            total = res['risk_summary']['total_records']
            total_exp = res['kpis']['total_expenditure_lakhs']
        elif scheme.upper() == "PMAY":
            res = scheme_service.analyze_pmay(state, dist_name)
            score = res['risk_summary']['risk_score']
            risk_lvl = res['risk_summary']['risk_level']
            anomalies = res['risk_summary']['anomalies_detected']
            total = res['risk_summary']['total_records']
            total_exp = res['kpis']['total_expenditure_lakhs']
        elif scheme.upper() == "PDS":
            res = scheme_service.analyze_pds(state, dist_name)
            score = res['risk_summary']['risk_score']
            risk_lvl = res['risk_summary']['risk_level']
            anomalies = res['risk_summary']['anomalies_detected']
            total = res['risk_summary']['total_records']
            total_exp = res['kpis']['total_expenditure_lakhs']
        elif scheme.upper() in ["SCHOLARSHIPS", "NSP"]:
            res = scheme_service.analyze_scholarships(state, dist_name)
            score = res['risk_summary']['risk_score']
            risk_lvl = res['risk_summary']['risk_level']
            anomalies = res['risk_summary']['anomalies_detected']
            total = res['risk_summary']['total_records']
            total_exp = res['kpis']['total_expenditure_lakhs']
        else:
            df_pred = model_service.predict(group)
            score, risk_lvl = model_service.calculate_overall_risk(df_pred)
            anomalies = int((df_pred['ml_flag'] == 1).sum())
            total = len(group)
            total_exp = float(group['Total_Exp'].sum())
        
        rankings.append({
            "district": str(dist_name),
            "risk_score": score,
            "risk_level": risk_lvl,
            "total_records": total,
            "anomalies": anomalies,
            "anomaly_rate": round(anomalies / total * 100, 2) if total > 0 else 0.0,
            "total_expenditure_lakhs": round(total_exp, 2)
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
async def get_state_overview(
    state: str = Query(..., description="State name"),
    scheme: str = Query("MGNREGA", description="Scheme name")
):
    df_state = data_service.get_state_records(state)
    if df_state.empty:
        raise HTTPException(status_code=404, detail=f"No records found for state '{state}'.")

    ranking_res = await get_district_ranking(state, scheme)
    rankings = ranking_res['rankings']

    total_records = sum(r['total_records'] for r in rankings)
    total_anomalies = sum(r['anomalies'] for r in rankings)
    avg_score = round(sum(r['risk_score'] for r in rankings) / len(rankings), 1) if rankings else 0.0
    
    state_risk = "CRITICAL" if avg_score >= 75 else "HIGH" if avg_score >= 55 else "MEDIUM" if avg_score >= 35 else "LOW"

    return {
        "state": state.upper(),
        "scheme": scheme.upper(),
        "total_records": total_records,
        "total_anomalies": total_anomalies,
        "state_risk_score": avg_score,
        "state_risk_level": state_risk,
        "total_expenditure_lakhs": round(sum(r['total_expenditure_lakhs'] for r in rankings), 2),
        "total_persondays": float(df_state['Persondays_of_Central_Liability_so_far'].sum()),
        "highest_risk_districts": rankings[:5],
        "lowest_risk_districts": rankings[-5:] if len(rankings) >= 5 else rankings
    }

@router.post("/sync/live")
async def sync_live(req: SyncRequest):
    result = live_api_service.fetch_live_district_data(req.state, req.district)
    return result
