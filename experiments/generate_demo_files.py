import sys
from pathlib import Path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

import numpy as np
import pandas as pd
from backend.app.services.model_service import model_service

# Directory setup
public_demo_dir = root_dir / "frontend" / "public" / "demo"
backend_demo_dir = root_dir / "backend" / "data" / "demo"
public_demo_dir.mkdir(parents=True, exist_ok=True)
backend_demo_dir.mkdir(parents=True, exist_ok=True)

months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

# 30 fictional districts:
# DEMO STATE NORTH: 8
# DEMO STATE SOUTH: 8
# DEMO STATE EAST: 7
# DEMO STATE WEST: 7
districts_all = [
    # NORTH (8)
    ('DEMO STATE NORTH', 'NORTH DISTRICT 01', False, None),
    ('DEMO STATE NORTH', 'NORTH DISTRICT 02', False, None),
    ('DEMO STATE NORTH', 'NORTH DISTRICT 03', True, 'ghost_workers'), # Target 58.7, HIGH
    ('DEMO STATE NORTH', 'NORTH DISTRICT 04', False, None),
    ('DEMO STATE NORTH', 'NORTH DISTRICT 05', False, None),
    ('DEMO STATE NORTH', 'NORTH DISTRICT 06', False, None),
    ('DEMO STATE NORTH', 'NORTH DISTRICT 07', True, 'ghost_workers'), # Target 45.2, MEDIUM
    ('DEMO STATE NORTH', 'NORTH DISTRICT 08', False, None),
    
    # SOUTH (8)
    ('DEMO STATE SOUTH', 'SOUTH DISTRICT 01', False, None),
    ('DEMO STATE SOUTH', 'SOUTH DISTRICT 02', True, 'material_inflation'), # Target 42.4, MEDIUM
    ('DEMO STATE SOUTH', 'SOUTH DISTRICT 03', False, None),
    ('DEMO STATE SOUTH', 'SOUTH DISTRICT 04', False, None),
    ('DEMO STATE SOUTH', 'SOUTH DISTRICT 05', True, 'year_end_spike'), # Target 39.2, MEDIUM
    ('DEMO STATE SOUTH', 'SOUTH DISTRICT 06', False, None),
    ('DEMO STATE SOUTH', 'SOUTH DISTRICT 07', False, None),
    ('DEMO STATE SOUTH', 'SOUTH DISTRICT 08', False, None),
    
    # EAST (7)
    ('DEMO STATE EAST', 'EAST DISTRICT 01', True, 'admin_padding'), # Target 42.0, MEDIUM
    ('DEMO STATE EAST', 'EAST DISTRICT 02', False, None),
    ('DEMO STATE EAST', 'EAST DISTRICT 03', False, None),
    ('DEMO STATE EAST', 'EAST DISTRICT 04', True, 'multi_violation'), # Target 40.0, MEDIUM
    ('DEMO STATE EAST', 'EAST DISTRICT 05', False, None),
    ('DEMO STATE EAST', 'EAST DISTRICT 06', False, None),
    ('DEMO STATE EAST', 'EAST DISTRICT 10', True, 'material_inflation'), # Target 48.0, MEDIUM
    
    # WEST (7)
    ('DEMO STATE WEST', 'WEST DISTRICT 01', False, None),
    ('DEMO STATE WEST', 'WEST DISTRICT 02', False, None),
    ('DEMO STATE WEST', 'WEST DISTRICT 03', False, None),
    ('DEMO STATE WEST', 'WEST DISTRICT 04', False, None),
    ('DEMO STATE WEST', 'WEST DISTRICT 05', False, None),
    ('DEMO STATE WEST', 'WEST DISTRICT 06', True, 'subtle_below_threshold'), # 4 injected, 0 caught, LOW
    ('DEMO STATE WEST', 'WEST DISTRICT 09', True, 'ratio_neutral_fake_jobcards'), # 6 injected, 0 caught, LOW
]

assert len(districts_all) == 30, f"Expected 30 districts, got {len(districts_all)}"

# Specs for flagged / planted districts:
# NORTH DISTRICT 03: 5 flags, target 58.7 (HIGH)
# EAST DISTRICT 10: 4 flags, target 48.0 (MEDIUM)
# NORTH DISTRICT 07: 3 flags, target 45.2 (MEDIUM)
# SOUTH DISTRICT 02: 3 flags, target 42.4 (MEDIUM)
# EAST DISTRICT 01: 3 flags, target 42.0 (MEDIUM)
# EAST DISTRICT 04: 3 flags, target 40.0 (MEDIUM)
# SOUTH DISTRICT 05: 2 flags, target 39.2 (MEDIUM)

flagged_specs = {
    'NORTH DISTRICT 03': {
        'fl_months': ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        'pattern': 'ghost_workers',
        'cost': 1000.0, 'mat_r': 0.22, 'adm_r': 0.037, # score = 95.0
        'norm_cost': 260.0, 'norm_mat': 0.22, 'norm_adm': 0.037, # score ~28.0 (let's check exact)
    },
    'EAST DISTRICT 10': {
        'fl_months': ['Jun', 'Jul', 'Aug', 'Sep'],
        'pattern': 'material_inflation',
        'cost': 250.0, 'mat_r': 0.7575, 'adm_r': 0.037, # score = 82.6
        'norm_cost': 250.0, 'norm_mat': 0.22, 'norm_adm': 0.037,
    },
    'NORTH DISTRICT 07': {
        'fl_months': ['Jun', 'Jul', 'Aug'],
        'pattern': 'ghost_workers',
        'cost': 925.0, 'mat_r': 0.22, 'adm_r': 0.037, # score = 90.0
        'norm_cost': 250.0, 'norm_mat': 0.22, 'norm_adm': 0.037,
    },
    'SOUTH DISTRICT 02': {
        'fl_months': ['Jul', 'Aug', 'Sep'],
        'pattern': 'material_inflation',
        'cost': 250.0, 'mat_r': 0.7375, 'adm_r': 0.037, # score = 81.0
        'norm_cost': 250.0, 'norm_mat': 0.22, 'norm_adm': 0.037,
    },
    'EAST DISTRICT 01': {
        'fl_months': ['May', 'Jun', 'Jul'],
        'pattern': 'admin_padding',
        'cost': 250.0, 'mat_r': 0.22, 'adm_r': 0.227, # score = 79.7
        'norm_cost': 250.0, 'norm_mat': 0.22, 'norm_adm': 0.037,
    },
    'EAST DISTRICT 04': {
        'fl_months': ['Jun', 'Jul', 'Aug'],
        'pattern': 'multi_violation',
        'cost': 674.5, 'mat_r': 0.42, 'adm_r': 0.10, # score = 73.3
        'norm_cost': 250.0, 'norm_mat': 0.22, 'norm_adm': 0.037,
    },
    'SOUTH DISTRICT 05': {
        'fl_months': ['Feb', 'Mar'],
        'pattern': 'year_end_spike',
        'cost': 964.0, 'mat_r': 0.22, 'adm_r': 0.037, # score = 92.6
        'norm_cost': 250.0, 'norm_mat': 0.22, 'norm_adm': 0.037,
    },
}

# Missed planted districts:
missed_specs = {
    'WEST DISTRICT 06': {
        'inj_months': ['Jun', 'Jul', 'Aug', 'Sep'],
        'pattern': 'subtle_below_threshold',
        'cost': 410.0, 'mat_r': 0.37, 'adm_r': 0.08, # all under statutory & breach
        'desc': 'Every ratio sits just under its threshold, so no rule fires.'
    },
    'WEST DISTRICT 09': {
        'inj_months': ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        'pattern': 'ratio_neutral_fake_jobcards',
        'cost': 250.0, 'mat_r': 0.22, 'adm_r': 0.037, 'total_mult': 3.0,
        'desc': 'Spending and persondays were inflated together, so all ratios look normal — the same reason our method missed the real Raichur social-audit case.'
    }
}

records = []
answer_key = []

for state, dist, is_planted, pattern in districts_all:
    if dist in flagged_specs:
        spec = flagged_specs[dist]
        for m in months:
            if m in spec['fl_months']:
                cost = spec['cost']
                mat_r = spec['mat_r']
                adm_r = spec['adm_r']
                tot = 120.0
                mat = tot * mat_r
                adm = tot * adm_r
                wage = max(0.0, tot - mat - adm)
                persondays = (tot * 100000.0) / cost
                records.append({
                    'state_name': state, 'district_name': dist, 'month': m,
                    'Total_Exp': tot, 'Material_and_skilled_Wages': mat,
                    'Total_Adm_Expenditure': adm, 'Wages': wage,
                    'Persondays_of_Central_Liability_so_far': persondays
                })
                # In answer key
                desc = {
                    'ghost_workers': 'High unit cost outlier with low reported persondays.',
                    'material_inflation': 'Material expenditure share exceeds 55% ceiling.',
                    'admin_padding': 'Administrative expenses exceed 14% statutory threshold.',
                    'multi_violation': 'Simultaneous breach of material and unit cost norms.',
                    'year_end_spike': 'Unusual expenditure spike in final quarter.'
                }[spec['pattern']]
                answer_key.append({
                    'state_name': state, 'district_name': dist, 'month': m,
                    'injected': 1, 'pattern': spec['pattern'], 'description': desc
                })
            else:
                # Normal month
                tot = 100.0
                if dist == 'NORTH DISTRICT 03':
                    # We want score around 58.7:
                    cost = 250.0
                    mat_r = 0.282
                    adm_r = 0.04
                else:
                    cost = 250.0
                    mat_r = 0.22
                    adm_r = 0.037
                mat = tot * mat_r
                adm = tot * adm_r
                wage = tot - mat - adm
                persondays = (tot * 100000.0) / cost
                records.append({
                    'state_name': state, 'district_name': dist, 'month': m,
                    'Total_Exp': tot, 'Material_and_skilled_Wages': mat,
                    'Total_Adm_Expenditure': adm, 'Wages': wage,
                    'Persondays_of_Central_Liability_so_far': persondays
                })
    elif dist in missed_specs:
        spec = missed_specs[dist]
        for m in months:
            if m in spec['inj_months']:
                tot = 100.0 * spec.get('total_mult', 1.0)
                cost = spec['cost']
                mat_r = spec['mat_r']
                adm_r = spec['adm_r']
                mat = tot * mat_r
                adm = tot * adm_r
                wage = tot - mat - adm
                persondays = (tot * 100000.0) / cost
                records.append({
                    'state_name': state, 'district_name': dist, 'month': m,
                    'Total_Exp': tot, 'Material_and_skilled_Wages': mat,
                    'Total_Adm_Expenditure': adm, 'Wages': wage,
                    'Persondays_of_Central_Liability_so_far': persondays
                })
                answer_key.append({
                    'state_name': state, 'district_name': dist, 'month': m,
                    'injected': 1, 'pattern': spec['pattern'], 'description': spec['desc']
                })
            else:
                # Normal month
                tot = 100.0
                cost = 250.0
                mat_r = 0.22
                adm_r = 0.037
                mat = tot * mat_r
                adm = tot * adm_r
                wage = tot - mat - adm
                persondays = (tot * 100000.0) / cost
                records.append({
                    'state_name': state, 'district_name': dist, 'month': m,
                    'Total_Exp': tot, 'Material_and_skilled_Wages': mat,
                    'Total_Adm_Expenditure': adm, 'Wages': wage,
                    'Persondays_of_Central_Liability_so_far': persondays
                })
    else:
        # Completely clean district
        for m in months:
            tot = 100.0
            cost = 250.0
            mat_r = 0.22
            adm_r = 0.037
            mat = tot * mat_r
            adm = tot * adm_r
            wage = tot - mat - adm
            persondays = (tot * 100000.0) / cost
            records.append({
                'state_name': state, 'district_name': dist, 'month': m,
                'Total_Exp': tot, 'Material_and_skilled_Wages': mat,
                'Total_Adm_Expenditure': adm, 'Wages': wage,
                'Persondays_of_Central_Liability_so_far': persondays
            })

df_records = pd.DataFrame(records)
df_key = pd.DataFrame(answer_key)

print(f"Generated records: {len(df_records)} (expected 360)")
print(f"Generated answer key rows: {len(df_key)} (expected 33: 23 TP + 10 FN)")

# Test predictions with model_service:
preds = model_service.predict(df_records)
print(f"Total flagged records: {preds['ml_flag'].sum()} (expected 23)")

# Check district composite scores:
dist_groups = preds.groupby(['state_name', 'district_name'])
dist_results = []
for (st, dist), grp in dist_groups:
    score, level = model_service.calculate_overall_risk(grp)
    fl = grp['ml_flag'].sum()
    dist_results.append({'state': st, 'district': dist, 'score': score, 'level': level, 'flags': fl})

dist_df = pd.DataFrame(dist_results).sort_values(by='score', ascending=False).reset_index(drop=True)
print("\nTop 10 Districts:")
print(dist_df.head(10))

# Save to public and backend dirs:
df_records.to_csv(public_demo_dir / "demo_upload_SYNTHETIC_v2.csv", index=False)
df_records.to_csv(backend_demo_dir / "demo_upload_SYNTHETIC_v2.csv", index=False)
df_key.to_csv(public_demo_dir / "demo_answer_key_v2.csv", index=False)
df_key.to_csv(backend_demo_dir / "demo_answer_key_v2.csv", index=False)

# Now generate demo_messy_bad_rows.csv (43 rows):
# - received 43
# - duplicates 3 (3 exact duplicate rows added)
# - Total_Exp <= 0: 5 rows
# - Persondays <= 0: 4 rows
# - non-numeric Wages: 3 rows
# - kept: 28 valid rows
# Total = 28 kept + 3 dup + 5 + 4 + 3 = 43 rows!
valid_28 = records[:28] # 28 valid clean records
messy_rows = [dict(r) for r in valid_28]

# Add 3 duplicates of the first 3 rows:
messy_rows.append(dict(valid_28[0]))
messy_rows.append(dict(valid_28[1]))
messy_rows.append(dict(valid_28[2]))

# Add 5 rows with Total_Exp <= 0:
for i, exp in enumerate([0.0, -15.0, 0.0, -50.0, 0.0]):
    row = dict(valid_28[i])
    row['month'] = f"BadExp_{i}"
    row['Total_Exp'] = exp
    messy_rows.append(row)

# Add 4 rows with Persondays <= 0:
for i, pday in enumerate([0.0, -10.0, 0.0, -500.0]):
    row = dict(valid_28[i])
    row['month'] = f"BadDays_{i}"
    row['Persondays_of_Central_Liability_so_far'] = pday
    messy_rows.append(row)

# Add 3 rows with non-numeric Wages:
for i, bad_wage in enumerate(["NaN_WAGE", "CORRUPTED", "N/A"]):
    row = dict(valid_28[i])
    row['month'] = f"BadWage_{i}"
    row['Wages'] = bad_wage
    messy_rows.append(row)

df_messy = pd.DataFrame(messy_rows)
print(f"\nGenerated demo_messy_bad_rows: {len(df_messy)} rows (expected 43)")
df_messy.to_csv(public_demo_dir / "demo_messy_bad_rows.csv", index=False)
df_messy.to_csv(backend_demo_dir / "demo_messy_bad_rows.csv", index=False)

# Now generate demo_messy_missing_column.csv (no Total_Adm_Expenditure):
df_missing = df_records.drop(columns=['Total_Adm_Expenditure']).head(50)
df_missing.to_csv(public_demo_dir / "demo_messy_missing_column.csv", index=False)
df_missing.to_csv(backend_demo_dir / "demo_messy_missing_column.csv", index=False)

print("All demo files written successfully!")
