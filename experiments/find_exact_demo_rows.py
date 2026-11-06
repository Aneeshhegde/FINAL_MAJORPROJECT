import sys
from pathlib import Path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

import numpy as np
import pandas as pd
from backend.app.services.model_service import model_service

from scipy.optimize import minimize

months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

# Target specs:
# (district_name, state_name, target_score, target_level, n_flags, pattern, flagged_months)
# Note: For NORTH DISTRICT 03, user specifically requests "Drill-down for NORTH DISTRICT 03 (Nov)"
district_specs = [
    ('NORTH DISTRICT 03', 'DEMO STATE NORTH', 58.7, 'HIGH', 4, 'ghost_workers', ['Aug', 'Sep', 'Oct', 'Nov']),
    ('EAST DISTRICT 10', 'DEMO STATE EAST', 48.0, 'MEDIUM', 4, 'material_inflation', ['Jun', 'Jul', 'Aug', 'Sep']),
    ('NORTH DISTRICT 07', 'DEMO STATE NORTH', 45.2, 'MEDIUM', 4, 'ghost_workers', ['May', 'Jun', 'Jul', 'Aug']),
    ('SOUTH DISTRICT 02', 'DEMO STATE SOUTH', 42.4, 'MEDIUM', 3, 'material_inflation', ['Jul', 'Aug', 'Sep']),
    ('EAST DISTRICT 01', 'DEMO STATE EAST', 42.0, 'MEDIUM', 3, 'admin_padding', ['May', 'Jun', 'Jul']),
    ('EAST DISTRICT 04', 'DEMO STATE EAST', 40.0, 'MEDIUM', 3, 'multi_violation', ['Jul', 'Aug', 'Sep']),
    ('SOUTH DISTRICT 05', 'DEMO STATE SOUTH', 39.2, 'MEDIUM', 2, 'year_end_spike', ['Feb', 'Mar']),
]

def make_row(state, district, month, cost, mat_ratio, adm_ratio):
    total_exp = 120.0
    mat = total_exp * mat_ratio
    adm = total_exp * adm_ratio
    wage = total_exp - mat - adm
    persondays = (total_exp * 100000.0) / cost
    return {
        'state_name': state,
        'district_name': district,
        'month': month,
        'Total_Exp': total_exp,
        'Material_and_skilled_Wages': mat,
        'Total_Adm_Expenditure': adm,
        'Wages': wage,
        'Persondays_of_Central_Liability_so_far': persondays
    }

def optimize_district(spec):
    dist_name, state, target_score, target_level, n_flags, pattern, fl_months = spec
    print(f"\n--- Optimizing {dist_name} for target score {target_score} ({target_level}) ---")
    
    # Grid search / optimization over baseline normal cost and anomalous parameter
    best_diff = 999.0
    best_rows = None
    best_score = None
    
    # We want flagged months to be flagged, normal months to NOT be flagged
    for normal_cost in np.linspace(220, 280, 7):
        for normal_mat in [0.22, 0.25]:
            for param in np.linspace(0.0, 1.0, 41):
                rows = []
                for m in months:
                    if m in fl_months:
                        if pattern == 'ghost_workers':
                            cost = 550.0 + param * 400.0 # > 500
                            mat_r = 0.25
                            adm_r = 0.04
                        elif pattern == 'material_inflation':
                            cost = 250.0
                            mat_r = 0.56 + param * 0.35 # > 0.55
                            adm_r = 0.04
                        elif pattern == 'admin_padding':
                            cost = 250.0
                            mat_r = 0.25
                            adm_r = 0.145 + param * 0.20 # > 0.14
                        elif pattern == 'multi_violation':
                            cost = 520.0 + param * 50.0 # > 500 and > 0.40
                            mat_r = 0.42 + param * 0.10
                            adm_r = 0.10
                        elif pattern == 'year_end_spike':
                            cost = 530.0 + param * 300.0
                            mat_r = 0.25
                            adm_r = 0.04
                        rows.append(make_row(state, dist_name, m, cost, mat_r, adm_r))
                    else:
                        rows.append(make_row(state, dist_name, m, normal_cost, normal_mat, 0.04))
                
                df = pd.DataFrame(rows)
                preds = model_service.predict(df)
                flags = preds['ml_flag'].values
                if sum(flags) != n_flags:
                    continue
                score, level = model_service.calculate_overall_risk(preds)
                diff = abs(score - target_score)
                if diff < best_diff:
                    best_diff = diff
                    best_score = score
                    best_level = level
                    best_rows = rows
                    if diff < 0.01:
                        break
            if best_diff < 0.01:
                break
        if best_diff < 0.01:
            break
            
    print(f"Result for {dist_name}: score={best_score} (target={target_score}), level={best_level}, diff={best_diff:.2f}")
    assert best_diff < 0.05, f"Could not match target for {dist_name}!"
    return best_rows

all_dist_rows = {}
for spec in district_specs:
    rows = optimize_district(spec)
    all_dist_rows[spec[0]] = rows

print("\nAll 7 districts optimized successfully!")
