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
        ml_score = float(row.get('ml_anomaly_score', 0.0))
        rule_violations = row.get('rule_violations', [])

        # Check deviations vs state statistics
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
                    unit = "₹" if feat == 'cost_per_day' else ""
                    val_str = f"{unit}{val:,.1f}" if feat == 'cost_per_day' else f"{val:.1%}"
                    mean_str = f"{unit}{mean:,.1f}" if feat == 'cost_per_day' else f"{mean:.1%}"
                    
                    reasons.append(
                        f"{label} is {val_str}, which is {abs(z_score):.1f} std deviations {direction} the state average ({mean_str})."
                    )
                    drivers.append({
                        'feature': feat,
                        'label': label,
                        'value': val,
                        'state_avg': mean,
                        'z_score': round(z_score, 2),
                        'impact': 'High' if abs(z_score) >= 3.0 else 'Medium'
                    })

        # Add statutory rule explanations if any
        if rule_violations:
            for viol in rule_violations:
                if viol not in reasons:
                    reasons.append(viol)

        if not reasons:
            if ml_score >= 60.0:
                reasons.append("Multi-dimensional pattern anomaly detected across simultaneous ratio interactions by Isolation Forest.")
            else:
                reasons.append("Pattern aligns with typical district operational baselines.")

        return {
            'summary': reasons[0] if reasons else "Normal operational pattern",
            'detailed_reasons': reasons,
            'key_drivers': drivers
        }

    def compute_state_baselines(self, state_df: pd.DataFrame) -> Dict[str, Dict[str, float]]:
        """
        Computes mean, median, and standard deviation baselines for the state.
        """
        stats = {}
        for col in ['material_ratio', 'admin_ratio', 'wage_ratio', 'cost_per_day']:
            if col in state_df.columns:
                series = pd.to_numeric(state_df[col], errors='coerce').fillna(0)
                stats[col] = {
                    'mean': float(series.mean()),
                    'std': float(series.std()),
                    'median': float(series.median()),
                    'p90': float(np.percentile(series, 90))
                }
        return stats

explanation_service = ExplanationService()
