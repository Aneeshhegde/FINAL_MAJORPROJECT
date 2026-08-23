import pandas as pd
import numpy as np
from typing import List, Dict, Tuple
from ..config import settings

class RulesService:
    """
    Evaluates statutory MGNREGA compliance rules and operational thresholds.
    """
    def __init__(self):
        self.material_threshold = settings.MATERIAL_RATIO_THRESHOLD  # 0.40
        self.admin_threshold = settings.ADMIN_RATIO_THRESHOLD        # 0.10
        self.wage_min_threshold = settings.WAGE_RATIO_MIN_THRESHOLD  # 0.60
        self.cost_per_day_threshold = settings.COST_PER_DAY_THRESHOLD # 450.0

    def evaluate_rules(self, row: pd.Series) -> Tuple[int, List[str], float]:
        """
        Applies rules to a single record row.
        Returns (rule_flag, list_of_violations, rule_severity_score)
        """
        violations = []
        severity = 0.0

        mat_ratio = float(row.get('material_ratio', 0.0))
        admin_ratio = float(row.get('admin_ratio', 0.0))
        wage_ratio = float(row.get('wage_ratio', 0.0))
        cost_per_day = float(row.get('cost_per_day', 0.0))

        # Rule 1: Material ratio exceeds 40% (Statutory 60:40 wage:material norm)
        if mat_ratio > self.material_threshold:
            diff_pct = (mat_ratio - self.material_threshold) / self.material_threshold * 100
            violations.append(
                f"Statutory 60:40 norm violation: Material ratio is {mat_ratio:.1%} (exceeds {self.material_threshold:.0%} limit by {diff_pct:.0f}%)"
            )
            severity += 35.0

        # Rule 2: Administrative expense exceeds 10% ceiling
        if admin_ratio > self.admin_threshold:
            violations.append(
                f"Excessive administrative overhead: {admin_ratio:.1%} of total expenditure (ceiling is {self.admin_threshold:.0%})"
            )
            severity += 25.0

        # Rule 3: Wage ratio below statutory 60% requirement
        if wage_ratio < self.wage_min_threshold and (mat_ratio + wage_ratio) > 0:
            violations.append(
                f"Depressed wage share: Wage expenditure is only {wage_ratio:.1%} (minimum statutory norm is {self.wage_min_threshold:.0%})"
            )
            severity += 25.0

        # Rule 4: High cost per personday
        if cost_per_day > self.cost_per_day_threshold:
            violations.append(
                f"Abnormal unit cost: ₹{cost_per_day:.0f} per personday (statutory benchmark is ₹{self.cost_per_day_threshold:.0f})"
            )
            severity += 15.0

        rule_flag = 1 if len(violations) > 0 else 0
        rule_score = min(100.0, severity)

        return rule_flag, violations, rule_score

    def evaluate_batch(self, df: pd.DataFrame) -> pd.DataFrame:
        df_rules = df.copy()
        
        rule_flags = []
        violations_list = []
        rule_scores = []

        for _, row in df_rules.iterrows():
            flag, viols, score = self.evaluate_rules(row)
            rule_flags.append(flag)
            violations_list.append(viols)
            rule_scores.append(score)

        df_rules['rule_flag'] = rule_flags
        df_rules['rule_violations'] = violations_list
        df_rules['rule_violations_str'] = ["; ".join(v) if v else "None" for v in violations_list]
        df_rules['rule_score'] = rule_scores

        return df_rules

rules_service = RulesService()
