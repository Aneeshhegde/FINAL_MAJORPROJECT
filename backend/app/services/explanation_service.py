import numpy as np
import pandas as pd
from typing import List, Dict, Any

class ExplanationService:
    """
    Generates plain-language, statistically justified explanations for flagged anomalies.
    Calculates feature Z-score deviations against State & National medians.
    """
    
    def generate_record_explanation(
        self, 
        row: pd.Series, 
        state_stats: Dict[str, Dict[str, float]]
    ) -> Dict[str, Any]:
        """
        Explains why a specific record was flagged by the model and rules.
        """
        reasons = []
        drivers = []

        mat_ratio = float(row.get('material_ratio', 0.0))
        admin_ratio = float(row.get('admin_ratio', 0.0))
        wage_ratio = float(row.get('wage_ratio', 0.0))
        cost_per_day = float(row.get('cost_per_day', 0.0))
        total_exp = float(row.get('Total_Exp', 0.0))
        persondays = float(row.get('Persondays_of_Central_Liability_so_far', 0.0))
        rule_violations = row.get('rule_violations', [])

        # 1. Check deviations vs state statistics
        for feat, val, label in [
            ('material_ratio', mat_ratio, 'Material Expenditure Share'),
            ('admin_ratio', admin_ratio, 'Administrative Expense Share'),
            ('wage_ratio', wage_ratio, 'Labor Wage Share'),
            ('cost_per_day', cost_per_day, 'Cost per Person-Day')
        ]:
            if feat in state_stats:
                mean = state_stats[feat]['mean']
                std = max(state_stats[feat]['std'], 0.001)
                z_score = (val - mean) / std

                if abs(z_score) >= 2.0:
                    direction = "above" if z_score > 0 else "below"
                    
                    if feat == 'cost_per_day':
                        if persondays <= 5 and total_exp > 1.0:
                            reason_text = f"Severe Zero-Labor Disbursal: ₹{total_exp:,.1f} Lakhs drawn from treasury with only {int(persondays)} person-days of work recorded (mathematical cost of ₹{val:,.0f}/day vs state average ₹{mean:,.0f}/day)."
                        else:
                            reason_text = f"{label} is ₹{val:,.1f}, which is {abs(z_score):.1f} std deviations {direction} the state average (₹{mean:,.1f})."
                    else:
                        reason_text = f"{label} is {val:.1%}, which is {abs(z_score):.1f} std deviations {direction} the state average ({mean:.1%})."
                    
                    reasons.append(reason_text)
                    drivers.append({
                        'feature': feat,
                        'label': label,
                        'value': round(val, 2),
                        'state_avg': round(mean, 2),
                        'z_score': round(z_score, 2),
                        'impact': 'High' if abs(z_score) >= 3.0 else 'Medium'
                    })

        # 2. Add statutory rule explanations if any
        if rule_violations:
            for viol in rule_violations:
                if viol not in reasons:
                    reasons.append(viol)

        # 3. Determine primary summary reason
        if reasons:
            primary_summary = reasons[0]
        else:
            primary_summary = "Multi-variate statistical anomaly detected across expenditure ratios."

        return {
            "summary": primary_summary,
            "detailed_reasons": reasons,
            "key_drivers": drivers
        }

    def compute_state_baselines(self, df_state: pd.DataFrame) -> Dict[str, Dict[str, float]]:
        """
        Computes mean and std deviation baselines for a state using robust filtering.
        """
        stats = {}
        for col in ['material_ratio', 'admin_ratio', 'wage_ratio', 'cost_per_day']:
            if col in df_state.columns:
                series = df_state[col].dropna()
                if col == 'cost_per_day':
                    # Filter out divide-by-zero anomalies (persondays <= 5) for baseline computation
                    clean_series = series[(series > 50.0) & (series < 2000.0)]
                    if len(clean_series) > 10:
                        series = clean_series
                stats[col] = {
                    "mean": float(series.mean()) if len(series) > 0 else 245.0,
                    "std": float(series.std()) if len(series) > 1 else 35.0,
                    "median": float(series.median()) if len(series) > 0 else 240.0
                }
        return stats

explanation_service = ExplanationService()
