import io
import re
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd
from fastapi import HTTPException
from .model_service import model_service
from .explanation_service import ExplanationService

explanation_service = ExplanationService()

MONTH_CANONICAL = {
    'apr': 'April', 'april': 'April',
    'may': 'May',
    'jun': 'June', 'june': 'June',
    'jul': 'July', 'july': 'July',
    'aug': 'Aug', 'august': 'Aug',
    'sep': 'Sep', 'sept': 'Sep', 'september': 'Sep',
    'oct': 'Oct', 'october': 'Oct',
    'nov': 'Nov', 'november': 'Nov',
    'dec': 'Dec', 'december': 'Dec',
    'jan': 'Jan', 'january': 'Jan',
    'feb': 'Feb', 'february': 'Feb',
    'mar': 'March', 'march': 'March'
}

def normalize_month(m: Any) -> str:
    s = str(m).strip()
    return MONTH_CANONICAL.get(s.lower(), s)

REQUIRED_COLUMNS = [
    'state_name',
    'district_name',
    'month',
    'Total_Exp',
    'Material_and_skilled_Wages',
    'Total_Adm_Expenditure',
    'Wages',
    'Persondays_of_Central_Liability_so_far'
]

# In-memory cache for latest analyzed upload (for exhibition quick comparison)
_latest_analysis_cache: Optional[Dict[str, Any]] = None

class UploadService:
    """
    Handles dataset upload, validation, model scoring, district aggregation,
    and ground-truth answer key comparison for GovGuard AI live exhibition demo.
    """

    def validate_and_clean_data(self, df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        # 1. Check required columns
        missing = [col for col in REQUIRED_COLUMNS if col not in df_raw.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail={"error": "missing_columns", "missing": missing}
            )

        rows_received = len(df_raw)

        # 2. Drop exact duplicates
        df_dedup = df_raw.drop_duplicates()
        duplicates_removed = rows_received - len(df_dedup)

        # 3. Check numeric columns for non-numeric or invalid entries
        numeric_cols = [
            'Total_Exp',
            'Material_and_skilled_Wages',
            'Total_Adm_Expenditure',
            'Wages',
            'Persondays_of_Central_Liability_so_far'
        ]

        df_work = df_dedup.copy()
        non_numeric_counts = {}
        for col in numeric_cols:
            coerced = pd.to_numeric(df_work[col], errors='coerce')
            invalid_num = coerced.isna()
            cnt = int(invalid_num.sum())
            if cnt > 0:
                non_numeric_counts[col] = cnt
            df_work[f'{col}_numeric'] = coerced

        # Filter out rows where any numeric col is NaN
        valid_numeric_mask = True
        for col in numeric_cols:
            valid_numeric_mask = valid_numeric_mask & df_work[f'{col}_numeric'].notna()

        # Check Total_Exp <= 0 and Persondays <= 0 on valid numeric rows
        total_exp_lte_zero = int(((df_work['Total_Exp_numeric'] <= 0) & valid_numeric_mask).sum())
        persondays_lte_zero = int(((df_work['Persondays_of_Central_Liability_so_far_numeric'] <= 0) & valid_numeric_mask).sum())

        clean_mask = (
            valid_numeric_mask & 
            (df_work['Total_Exp_numeric'] > 0) & 
            (df_work['Persondays_of_Central_Liability_so_far_numeric'] > 0)
        )

        df_clean = df_work[clean_mask].copy()
        for col in numeric_cols:
            df_clean[col] = df_clean[f'{col}_numeric']
            df_clean.drop(columns=[f'{col}_numeric'], inplace=True)

        rows_kept = len(df_clean)

        validation_report = {
            "rows_received": rows_received,
            "duplicates_removed": duplicates_removed,
            "exact_duplicates": duplicates_removed,
            "total_exp_lte_zero": total_exp_lte_zero,
            "total_exp_invalid": total_exp_lte_zero,
            "persondays_lte_zero": persondays_lte_zero,
            "persondays_invalid": persondays_lte_zero,
            "non_numeric_wages": non_numeric_counts.get("Wages", 0),
            "non_numeric_columns": non_numeric_counts,
            "rows_kept": rows_kept
        }

        return df_clean, validation_report

    def analyze_dataset(self, df_clean: pd.DataFrame, validation: Dict[str, Any]) -> Dict[str, Any]:
        global _latest_analysis_cache

        # Check if synthetic demonstration data
        is_synthetic = bool(
            df_clean['state_name'].astype(str).str.contains("DEMO", case=False).any()
        )

        # Run predictions via model_service
        preds = model_service.predict(df_clean)

        # Determine trigger per record using EXACT same thresholds as model_service
        triggers = []
        for idx in range(len(preds)):
            cost = preds['cost_per_day'].iloc[idx]
            mat_r = preds['material_ratio'].iloc[idx]
            adm_r = preds['admin_ratio'].iloc[idx]
            flag = preds['ml_flag'].iloc[idx]

            if cost > 500.0:
                triggers.append("Cost breach")
            elif mat_r > 0.55:
                triggers.append("Material breach")
            elif adm_r > 0.14:
                triggers.append("Admin breach")
            elif flag == 1:
                triggers.append("Anomaly + confirmation")
            else:
                triggers.append("Not flagged")

        preds['trigger'] = triggers

        # Compute state baselines for explanations
        state_baselines = {}
        for state, state_group in preds.groupby('state_name'):
            state_baselines[state] = explanation_service.compute_state_baselines(state_group)

        # Build records list with explanations
        records_out = []
        for idx in range(len(preds)):
            row = preds.iloc[idx]
            st = row['state_name']
            dist = row['district_name']
            mo = row['month']
            fl = bool(row['ml_flag'] == 1)

            rec_dict = {
                "record_id": f"{st}_{dist}_{mo}",
                "state_name": str(st),
                "district_name": str(dist),
                "district": str(dist),
                "month": str(mo),
                "cost_per_day": round(float(row['cost_per_day']), 2),
                "cost_per_personday": round(float(row['cost_per_day']), 2),
                "material_ratio": round(float(row['material_ratio']), 4),
                "admin_ratio": round(float(row['admin_ratio']), 4),
                "wage_ratio": round(float(row['wage_ratio']), 4),
                "Total_Exp": round(float(row['Total_Exp']), 2),
                "Material_and_skilled_Wages": round(float(row['Material_and_skilled_Wages']), 2),
                "Total_Adm_Expenditure": round(float(row['Total_Adm_Expenditure']), 2),
                "Wages": round(float(row['Wages']), 2),
                "Persondays_of_Central_Liability_so_far": round(float(row['Persondays_of_Central_Liability_so_far']), 1),
                "risk_score": round(float(row['ml_anomaly_score']), 1),
                "risk_level": str(row['risk_level']),
                "flagged": fl,
                "trigger": str(row['trigger']),
                "explanation": None
            }

            if fl:
                st_stats = state_baselines.get(st, {})
                rec_dict["explanation"] = explanation_service.generate_record_explanation(row, st_stats)

            records_out.append(rec_dict)

        # District-level overall risk aggregation
        districts_out = []
        dist_groups = preds.groupby(['state_name', 'district_name'])
        for (st, dist), grp in dist_groups:
            score, level = model_service.calculate_overall_risk(grp)
            months_flagged = int((grp['ml_flag'] == 1).sum())

            # Top trigger
            fl_triggers = grp[grp['ml_flag'] == 1]['trigger'].tolist()
            if fl_triggers:
                # Priority trigger
                top_trig = fl_triggers[0]
                for priority in ["Cost breach", "Material breach", "Admin breach", "Anomaly + confirmation"]:
                    if priority in fl_triggers:
                        top_trig = priority
                        break
            else:
                top_trig = "None"

            districts_out.append({
                "state_name": str(st),
                "district_name": str(dist),
                "district": str(dist),
                "risk_score": round(float(score), 1),
                "risk_level": str(level),
                "months_flagged": months_flagged,
                "top_trigger": top_trig
            })

        # Sort districts by risk_score descending
        districts_out.sort(key=lambda d: d['risk_score'], reverse=True)

        # Assign ranks
        for rank_idx, d in enumerate(districts_out, 1):
            d['rank'] = rank_idx

        # KPIs
        records_count = len(records_out)
        flagged_count = sum(1 for r in records_out if r['flagged'])
        districts_flagged_count = sum(1 for d in districts_out if d['months_flagged'] > 0)

        districts_by_level = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
        for d in districts_out:
            districts_by_level[d['risk_level']] = districts_by_level.get(d['risk_level'], 0) + 1

        response = {
            "is_synthetic": is_synthetic,
            "validation": validation,
            "kpis": {
                "records": records_count,
                "flagged_records": flagged_count,
                "districts_flagged": districts_flagged_count,
                "districts_by_level": districts_by_level
            },
            "districts": districts_out,
            "records": records_out
        }

        _latest_analysis_cache = response
        return response

    def compare_with_answer_key(
        self,
        df_key: pd.DataFrame,
        analysis_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        global _latest_analysis_cache

        if analysis_data is None:
            if _latest_analysis_cache is not None:
                analysis_data = _latest_analysis_cache
            else:
                # Load default synthetic demo dataset
                demo_path = Path(__file__).resolve().parent.parent / "data" / "demo" / "demo_upload_SYNTHETIC_v2.csv"
                if demo_path.exists():
                    df_demo = pd.read_csv(demo_path)
                    df_clean, val = self.validate_and_clean_data(df_demo)
                    analysis_data = self.analyze_dataset(df_clean, val)
                else:
                    raise HTTPException(status_code=400, detail="No analyzed dataset available for answer key comparison.")

        records = analysis_data.get("records", [])
        districts = analysis_data.get("districts", [])
        dist_rank_map = {d["district_name"]: (d.get("rank", 99), d["risk_level"]) for d in districts}

        # Build map of analyzed records: (state_name, district_name, month) -> flagged
        analyzed_map = {}
        for r in records:
            key = (str(r['state_name']).strip(), str(r['district_name']).strip(), normalize_month(r['month']))
            analyzed_map[key] = bool(r['flagged'])

        # Build key map: (state, district, month) -> (injected, pattern, description)
        key_map = {}
        pattern_totals = {}
        pattern_caught = {}

        for _, row in df_key.iterrows():
            st = str(row['state_name']).strip()
            dist = str(row['district_name']).strip()
            mo = normalize_month(row.get('month', ''))
            inj = int(row.get('injected', 1))
            pat = str(row.get('pattern', 'unknown')).strip()
            desc = str(row.get('description', '')).strip()

            k = (st, dist, mo)
            key_map[k] = (inj, pat, desc)

            if pat not in pattern_totals:
                pattern_totals[pat] = 0
                pattern_caught[pat] = 0
            if inj == 1:
                pattern_totals[pat] += 1

        # Evaluate confusion matrix across all analyzed records
        tp = 0
        fp = 0
        fn = 0
        tn = 0

        for k, flagged in analyzed_map.items():
            if k in key_map and key_map[k][0] == 1:
                pat = key_map[k][1]
                if flagged:
                    tp += 1
                    pattern_caught[pat] = pattern_caught.get(pat, 0) + 1
                else:
                    fn += 1
            else:
                if flagged:
                    fp += 1
                else:
                    tn += 1

        # Planted districts summary (unique districts in answer key where injected == 1)
        planted_dist_map = {}
        for (st, dist, mo), (inj, pat, desc) in key_map.items():
            if inj == 1:
                if dist not in planted_dist_map:
                    planted_dist_map[dist] = {
                        "district": dist,
                        "state_name": st,
                        "pattern": pat,
                        "description": desc,
                        "injected_months": 0,
                        "caught_months": 0
                    }
                planted_dist_map[dist]["injected_months"] += 1
                if analyzed_map.get((st, dist, mo), False):
                    planted_dist_map[dist]["caught_months"] += 1

        planted_districts_list = []
        for dist, info in planted_dist_map.items():
            rank, level = dist_rank_map.get(dist, (99, "LOW"))
            is_caught = bool(info["caught_months"] > 0)
            
            # Contextual note for missed patterns
            explanation_note = info["description"]
            if info["pattern"] == "subtle_below_threshold":
                explanation_note = "Every ratio sits just under its threshold, so no rule fires."
            elif info["pattern"] == "ratio_neutral_fake_jobcards":
                explanation_note = "Spending and persondays were inflated together, so all ratios look normal — the same reason our method missed the real Raichur social-audit case."

            planted_districts_list.append({
                "district": dist,
                "district_name": dist,
                "pattern": info["pattern"],
                "rank": rank,
                "risk_level": level,
                "caught": is_caught,
                "caught_months": info["caught_months"],
                "injected_months": info["injected_months"],
                "explanation_note": explanation_note
            })

        # Sort planted districts by rank
        planted_districts_list.sort(key=lambda d: d['rank'])

        # Per pattern stats
        patterns_out = {}
        for pat in pattern_totals:
            patterns_out[pat] = {
                "caught": pattern_caught.get(pat, 0),
                "total": pattern_totals[pat]
            }

        precision = round(tp / (tp + fp), 3) if (tp + fp) > 0 else 0.0
        recall = round(tp / (tp + fn), 3) if (tp + fn) > 0 else 0.0
        f1 = round(2 * precision * recall / (precision + recall), 3) if (precision + recall) > 0 else 0.0
        accuracy = round((tp + tn) / (tp + tn + fp + fn), 3) if (tp + tn + fp + fn) > 0 else 0.0

        return {
            "confusion_matrix": {
                "tp": tp,
                "fp": fp,
                "fn": fn,
                "tn": tn,
                "precision": precision,
                "recall": recall,
                "f1": f1,
                "accuracy": accuracy
            },
            "patterns": patterns_out,
            "planted_districts": planted_districts_list
        }

upload_service = UploadService()
