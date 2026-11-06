import sys
import io
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, accuracy_score, roc_auc_score, roc_curve, precision_recall_curve
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
import matplotlib.pyplot as plt
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_PATH = r"backend/data/mgnrega.csv"
MODEL_PATH = r"backend/ml/isolation_forest.pkl"
SCALER_PATH = r"backend/ml/scaler.pkl"

df_raw = pd.read_csv(DATA_PATH, low_memory=False)
raw_rows = len(df_raw)

# Breakdown of filters
tot_exp_num = pd.to_numeric(df_raw['Total_Exp'], errors='coerce')
pdays_num = pd.to_numeric(df_raw['Persondays_of_Central_Liability_so_far'], errors='coerce')
mat_num = pd.to_numeric(df_raw['Material_and_skilled_Wages'], errors='coerce')
adm_num = pd.to_numeric(df_raw['Total_Adm_Expenditure'], errors='coerce')
wages_num = pd.to_numeric(df_raw['Wages'], errors='coerce')

cond_tot_exp_invalid = tot_exp_num.isna() | (tot_exp_num <= 0)
cond_pdays_invalid = pdays_num.isna() | (pdays_num <= 0)
cond_both_invalid = cond_tot_exp_invalid & cond_pdays_invalid
cond_only_tot_exp_invalid = cond_tot_exp_invalid & (~cond_pdays_invalid)
cond_only_pdays_invalid = cond_pdays_invalid & (~cond_tot_exp_invalid)
cond_any_invalid = cond_tot_exp_invalid | cond_pdays_invalid

print("=== DETAILED BREAKDOWN OF REMOVED RECORDS ===")
print(f"Total raw rows: {raw_rows}")
print(f"1. Total_Exp <= 0 only: {int(cond_only_tot_exp_invalid.sum())} ({cond_only_tot_exp_invalid.sum()/raw_rows*100:.4f}%)")
print(f"2. Persondays <= 0 only: {int(cond_only_pdays_invalid.sum())} ({cond_only_pdays_invalid.sum()/raw_rows*100:.4f}%)")
print(f"3. Both Total_Exp <= 0 and Persondays <= 0: {int(cond_both_invalid.sum())} ({cond_both_invalid.sum()/raw_rows*100:.4f}%)")
print(f"Total removed records: {int(cond_any_invalid.sum())} ({cond_any_invalid.sum()/raw_rows*100:.4f}%)")
print(f"Final usable records: {raw_rows - int(cond_any_invalid.sum())} ({(raw_rows - int(cond_any_invalid.sum()))/raw_rows*100:.4f}%)")

valid_mask = ~cond_any_invalid
df_eval = df_raw[valid_mask].copy()

tot_e = tot_exp_num[valid_mask].values
mat_e = mat_num[valid_mask].fillna(0).values
adm_e = adm_num[valid_mask].fillna(0).values
wag_e = wages_num[valid_mask].fillna(0).values
pdays_e = pdays_num[valid_mask].values

mat_ratio = mat_e / tot_e
adm_ratio = adm_e / tot_e
wage_ratio = wag_e / tot_e
cost_per_day = (tot_e * 100000.0) / pdays_e

X = np.column_stack([mat_ratio, adm_ratio, wage_ratio, cost_per_day])

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

X_scaled = scaler.transform(X)
dec_scores = model.decision_function(X_scaled)

# 10 Random Records Sample Check
np.random.seed(42)
sample_indices = np.random.choice(len(df_eval), size=10, replace=False)
print("\n=== 10 RANDOMLY SELECTED RECORDS FOR MANUAL VERIFICATION ===")
for idx in sample_indices:
    row = df_eval.iloc[idx]
    te = tot_e[idx]
    me = mat_e[idx]
    ae = adm_e[idx]
    we = wag_e[idx]
    pd_v = pdays_e[idx]
    mr = mat_ratio[idx]
    ar = adm_ratio[idx]
    wr = wage_ratio[idx]
    cpd = cost_per_day[idx]
    state = row.get('state_name', 'Unknown')
    dist = row.get('district_name', 'Unknown')
    fy = row.get('fin_year', 'Unknown')
    m = row.get('month', 'Unknown')
    print(f"Idx {idx} | {state} - {dist} | FY: {fy}, Month: {m}")
    print(f"   Raw: Total_Exp={te:.2f}L, Mat={me:.2f}L, Adm={ae:.2f}L, Wages={we:.2f}L, Persondays={pd_v:.0f}")
    print(f"   Calc: mat_ratio={mr:.4f}, admin_ratio={ar:.4f}, wage_ratio={wr:.4f}, cost_per_day=Rs {cpd:.2f}")

# Check ROC-AUC under various score definitions
y_proxy = ((mat_ratio > 0.40) | (adm_ratio > 0.10) | (cost_per_day > 450.0)).astype(int)

# continuous scores:
# 1. -dec_scores
auc_neg_dec = roc_auc_score(y_proxy, -dec_scores) * 100
# 2. base_anomaly_scores
base_scores = np.clip(50.0 - (dec_scores * 135.0), 0.0, 100.0)
auc_base = roc_auc_score(y_proxy, base_scores) * 100

# 3. Adjusted risk scores from model_service
unit_cost_outlier = cost_per_day > 500.0
severe_mat_skew = mat_ratio > 0.55
severe_adm_skew = adm_ratio > 0.14
adjusted_scores = []
for i in range(len(base_scores)):
    score = float(base_scores[i])
    if unit_cost_outlier[i]:
        score = max(score, 65.0 + min(30.0, (cost_per_day[i] - 550.0) / 15.0))
    if severe_mat_skew[i]:
        score = max(score, 70.0 + min(25.0, (mat_ratio[i] - 0.60) * 80.0))
    if severe_adm_skew[i]:
        score = max(score, 72.0 + min(25.0, (adm_ratio[i] - 0.15) * 100.0))
    adjusted_scores.append(min(100.0, max(0.0, score)))
adjusted_scores = np.array(adjusted_scores)
auc_adjusted = roc_auc_score(y_proxy, adjusted_scores) * 100

print("\n=== ROC-AUC SCORES UNDER DIFFERENT CONTINUOUS SCORES ===")
print(f"ROC-AUC (-decision_function): {auc_neg_dec:.2f}%")
print(f"ROC-AUC (base_anomaly_scores): {auc_base:.2f}%")
print(f"ROC-AUC (adjusted_risk_scores): {auc_adjusted:.2f}%")

# Synthetic Stress Tests (Table II)
print("\n=== SYNTHETIC STRESS TESTS (TABLE II) ===")
syn_cases = [
    {
        "name": "Extreme Material Skew",
        "desc": "Material Ratio = 85% (Limit 40%)",
        "Total_Exp": 100.0,
        "Material_and_skilled_Wages": 85.0,
        "Total_Adm_Expenditure": 5.0,
        "Wages": 10.0,
        "Persondays_of_Central_Liability_so_far": 5000.0,
        "expected_label": "Anomaly",
        "expected_score": "95.0 / 100 (CRITICAL)"
    },
    {
        "name": "Administrative Embezzlement",
        "desc": "Admin Ratio = 35% (Limit 10%)",
        "Total_Exp": 100.0,
        "Material_and_skilled_Wages": 20.0,
        "Total_Adm_Expenditure": 35.0,
        "Wages": 45.0,
        "Persondays_of_Central_Liability_so_far": 5000.0,
        "expected_label": "Anomaly",
        "expected_score": "95.0 / 100 (CRITICAL)"
    },
    {
        "name": "Unit Cost Inflation",
        "desc": "Cost/day = ₹1,450 (Limit ₹450)",
        "Total_Exp": 1.0,
        "Material_and_skilled_Wages": 0.2,
        "Total_Adm_Expenditure": 0.02,
        "Wages": 0.78,
        "Persondays_of_Central_Liability_so_far": 69.0,
        "expected_label": "Anomaly",
        "expected_score": "95.0 / 100 (CRITICAL)"
    },
    {
        "name": "Multi-Violation Budget Dump",
        "desc": "Simultaneous Extreme Breaches",
        "Total_Exp": 100.0,
        "Material_and_skilled_Wages": 80.0,
        "Total_Adm_Expenditure": 18.0,
        "Wages": 2.0,
        "Persondays_of_Central_Liability_so_far": 45.0,
        "expected_label": "Anomaly",
        "expected_score": "95.0 / 100 (CRITICAL)"
    },
    {
        "name": "Honest Compliant Baseline",
        "desc": "Mat=22%, Admin=4%, ₹222/day",
        "Total_Exp": 10.0,
        "Material_and_skilled_Wages": 2.2,
        "Total_Adm_Expenditure": 0.4,
        "Wages": 7.4,
        "Persondays_of_Central_Liability_so_far": 4500.0,
        "expected_label": "Normal",
        "expected_score": "24.5 / 100 (LOW RISK)"
    }
]

syn_df = pd.DataFrame(syn_cases)
sys.path.insert(0, r"backend")
from app.services.model_service import model_service
syn_preds = model_service.predict(syn_df)

for i, case in enumerate(syn_cases):
    row_pred = syn_preds.iloc[i]
    pred_flag = row_pred['ml_flag']
    pred_label = "ANOMALY" if pred_flag == 1 else "NORMAL"
    pred_score = row_pred['ml_anomaly_score']
    risk_level = row_pred['risk_level']
    match = "MATCH" if (pred_label == "ANOMALY" and case['expected_label'] == "Anomaly") or (pred_label == "NORMAL" and case['expected_label'] == "Normal") else "MISMATCH"
    print(f"Case {i+1}: {case['name']}")
    print(f"   Injected: {case['desc']}")
    print(f"   Paper Expectation: {case['expected_label']} | {case['expected_score']}")
    print(f"   Actual Output: {pred_label} | Score: {pred_score:.1f}/100 ({risk_level}) -> {match}")

