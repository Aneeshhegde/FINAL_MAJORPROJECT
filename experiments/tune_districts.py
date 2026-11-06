import sys
from pathlib import Path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

import numpy as np
import pandas as pd
from backend.app.services.model_service import model_service

months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

# Specs for the 7 caught districts:
districts_info = [
    {
        'name': 'NORTH DISTRICT 03', 'state': 'DEMO STATE NORTH', 'target': 58.7,
        'pattern': 'ghost_workers', 'fl_months': ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        'fl_cost': 1000.0, 'fl_mat': 0.25, 'fl_adm': 0.04, 'norm_cost': 260.0
    },
    {
        'name': 'EAST DISTRICT 10', 'state': 'DEMO STATE EAST', 'target': 48.0,
        'pattern': 'material_inflation', 'fl_months': ['Jun', 'Jul', 'Aug', 'Sep'],
        'fl_cost': 260.0, 'fl_mat': 0.75, 'fl_adm': 0.04, 'norm_cost': 260.0
    },
    {
        'name': 'NORTH DISTRICT 07', 'state': 'DEMO STATE NORTH', 'target': 45.2,
        'pattern': 'ghost_workers', 'fl_months': ['Jun', 'Jul', 'Aug'],
        'fl_cost': 1000.0, 'fl_mat': 0.25, 'fl_adm': 0.04, 'norm_cost': 260.0
    },
    {
        'name': 'SOUTH DISTRICT 02', 'state': 'DEMO STATE SOUTH', 'target': 42.4,
        'pattern': 'material_inflation', 'fl_months': ['Jul', 'Aug', 'Sep'],
        'fl_cost': 260.0, 'fl_mat': 0.75, 'fl_adm': 0.04, 'norm_cost': 260.0
    },
    {
        'name': 'EAST DISTRICT 01', 'state': 'DEMO STATE EAST', 'target': 42.0,
        'pattern': 'admin_padding', 'fl_months': ['May', 'Jun', 'Jul'],
        'fl_cost': 260.0, 'fl_mat': 0.25, 'fl_adm': 0.25, 'norm_cost': 260.0
    },
    {
        'name': 'EAST DISTRICT 04', 'state': 'DEMO STATE EAST', 'target': 40.0,
        'pattern': 'multi_violation', 'fl_months': ['Jun', 'Jul', 'Aug'],
        'fl_cost': 550.0, 'fl_mat': 0.45, 'fl_adm': 0.10, 'norm_cost': 260.0
    },
    {
        'name': 'SOUTH DISTRICT 05', 'state': 'DEMO STATE SOUTH', 'target': 39.2,
        'pattern': 'year_end_spike', 'fl_months': ['Feb', 'Mar'],
        'fl_cost': 1000.0, 'fl_mat': 0.25, 'fl_adm': 0.04, 'norm_cost': 260.0
    },
]

def make_record(state, dist, month, cost, mat_ratio, adm_ratio):
    total_exp = 120.0
    mat = total_exp * mat_ratio
    adm = total_exp * adm_ratio
    wage = max(0.0, total_exp - mat - adm)
    persondays = (total_exp * 100000.0) / cost
    return {
        'state_name': state,
        'district_name': dist,
        'month': month,
        'Total_Exp': total_exp,
        'Material_and_skilled_Wages': mat,
        'Total_Adm_Expenditure': adm,
        'Wages': wage,
        'Persondays_of_Central_Liability_so_far': persondays
    }

for d in districts_info:
    # Fine-tune fl_cost / fl_mat / fl_adm and normal row parameters
    best_diff = 999
    best_res = None
    target = d['target']
    
    # We can fine tune by adjusting anomalous cost or normal features
    # Notice: In model_service,
    # cost_per_day > 500 gives score = 65 + min(30, (cost - 550)/15)
    # mat_ratio > 0.55 gives score = 70 + min(25, (mat_ratio - 0.60)*80)
    # adm_ratio > 0.14 gives score = 72 + min(25, (adm_ratio - 0.15)*100)
    
    for fl_param in np.linspace(0.0, 1.0, 501):
        if d['pattern'] in ['ghost_workers', 'year_end_spike']:
            cost = 550.0 + fl_param * 450.0 # 550 to 1000 -> score 65 to 95
            mat_r = 0.22
            adm_r = 0.037
        elif d['pattern'] == 'material_inflation':
            cost = 250.0
            mat_r = 0.56 + fl_param * 0.35 # 0.56 to 0.91 -> score 70 to 95
            adm_r = 0.037
        elif d['pattern'] == 'admin_padding':
            cost = 250.0
            mat_r = 0.22
            adm_r = 0.145 + fl_param * 0.25 # 0.145 to 0.395 -> score 72 to 95
        elif d['pattern'] == 'multi_violation':
            cost = 550.0 + fl_param * 400.0
            mat_r = 0.42
            adm_r = 0.10
            
        for norm_param in np.linspace(220, 270, 21):
            rows = []
            for m in months:
                if m in d['fl_months']:
                    rows.append(make_record(d['state'], d['name'], m, cost, mat_r, adm_r))
                else:
                    rows.append(make_record(d['state'], d['name'], m, norm_param, 0.22, 0.037))
            
            df = pd.DataFrame(rows)
            preds = model_service.predict(df)
            if sum(preds['ml_flag']) != len(d['fl_months']):
                continue
            score, level = model_service.calculate_overall_risk(preds)
            diff = abs(score - target)
            if diff < best_diff:
                best_diff = diff
                best_res = (score, level, fl_param, norm_param)
                if diff == 0.0:
                    break
        if best_diff == 0.0:
            break
            
    print(f"{d['name']}: target={target}, best={best_res[0]} ({best_res[1]}), diff={best_diff:.2f}, params={best_res[2:]}")

