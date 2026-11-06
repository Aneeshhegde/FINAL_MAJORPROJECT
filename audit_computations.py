import os
import sys
import io
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, accuracy_score, roc_auc_score

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_PATH = r"backend/data/mgnrega.csv"
MODEL_PATH = r"backend/ml/isolation_forest.pkl"
SCALER_PATH = r"backend/ml/scaler.pkl"

print("--- 1. DATASET PROPERTIES ---")
df_raw = pd.read_csv(DATA_PATH, low_memory=False)
raw_rows, raw_cols = df_raw.shape
print(f"Raw shape: {raw_rows} rows, {raw_cols} columns")
print(f"Column names: {list(df_raw.columns)}")
print(f"Dtypes:\n{df_raw.dtypes}")

# Let's inspect states, districts, financial years
if 'State_Name' in df_raw.columns:
    states = df_raw['State_Name'].dropna().unique()
    print(f"Unique states ({len(states)}): {states[:10]}...")
if 'District_Name' in df_raw.columns:
    districts = df_raw['District_Name'].dropna().unique()
    print(f"Unique districts count: {len(districts)}")
if 'financial_year' in df_raw.columns:
    fys = df_raw['financial_year'].dropna().unique()
    print(f"Financial years: {fys}")
elif 'fin_year' in df_raw.columns:
    fys = df_raw['fin_year'].dropna().unique()
    print(f"Financial years: {fys}")
else:
    for col in df_raw.columns:
        if 'year' in col.lower():
            print(f"Year column: {col}, unique values: {df_raw[col].unique()[:10]}")

# Missing values & invalid breakdown
total_exp_num = pd.to_numeric(df_raw['Total_Exp'], errors='coerce')
persondays_num = pd.to_numeric(df_raw['Persondays_of_Central_Liability_so_far'], errors='coerce')
mat_num = pd.to_numeric(df_raw['Material_and_skilled_Wages'], errors='coerce')
adm_num = pd.to_numeric(df_raw['Total_Adm_Expenditure'], errors='coerce')
wages_num = pd.to_numeric(df_raw['Wages'], errors='coerce')

duplicates_count = int(df_raw.duplicated().sum())
print(f"Duplicate rows: {duplicates_count}")

# Check filter conditions
tot_exp_le_0 = (total_exp_num <= 0) | total_exp_num.isna()
pdays_le_0 = (persondays_num <= 0) | persondays_num.isna()

both_valid = (total_exp_num > 0) & (persondays_num > 0)
final_valid_count = int(both_valid.sum())
removed_count = raw_rows - final_valid_count

print(f"Total_Exp <= 0 or NaN: {int(tot_exp_le_0.sum())}")
print(f"Persondays <= 0 or NaN: {int(pdays_le_0.sum())}")
print(f"Both Total_Exp > 0 AND Persondays > 0: {final_valid_count}")
print(f"Removed count: {removed_count}")

# Let's inspect Model & Scaler
print("\n--- 2. MODEL & SCALER INSPECTION ---")
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

print(f"Model class: {model.__class__.__name__}")
print(f"n_estimators: {model.n_estimators}")
print(f"max_samples: {model.max_samples}")
print(f"contamination: {model.contamination}")
print(f"max_features: {model.max_features}")
print(f"bootstrap: {model.bootstrap}")
print(f"random_state: {model.random_state}")
print(f"offset_: {getattr(model, 'offset_', None)}")
print(f"n_features_in_: {getattr(model, 'n_features_in_', None)}")

print(f"Scaler mean_: {scaler.mean_}")
print(f"Scaler scale_ (std): {scaler.scale_}")
print(f"Scaler var_: {scaler.var_}")

# Features
df_eval = df_raw[both_valid].copy()
tot_e = total_exp_num[both_valid].values
mat_e = mat_num[both_valid].fillna(0).values
adm_e = adm_num[both_valid].fillna(0).values
wag_e = wages_num[both_valid].fillna(0).values
pdays_e = persondays_num[both_valid].values

mat_ratio = mat_e / tot_e
adm_ratio = adm_e / tot_e
wage_ratio = wag_e / tot_e
cost_per_day = (tot_e * 100000.0) / pdays_e

X = np.column_stack([mat_ratio, adm_ratio, wage_ratio, cost_per_day])
X_scaled = scaler.transform(X)

# Check scaler fit consistency
calc_mean = np.mean(X, axis=0)
calc_std = np.std(X, axis=0)
print(f"Calculated mean on valid set: {calc_mean}")
print(f"Calculated std on valid set:  {calc_std}")
print(f"Scaler mean diff: {scaler.mean_ - calc_mean}")
print(f"Scaler scale diff: {scaler.scale_ - calc_std}")

# Model scores
dec_scores = model.decision_function(X_scaled)
# Sklearn decision function: offset_ is -0.5 when contamination='auto' or specified.
# decision_function(X) = score_samples(X) - offset_
# score_samples(X) = - 2^(-E(h(x))/c(n))

# Ground truth proxy labels
y_proxy = ((mat_ratio > 0.40) | (adm_ratio > 0.10) | (cost_per_day > 450.0)).astype(int)
print(f"Total y_proxy anomalies: {y_proxy.sum()} ({y_proxy.mean()*100:.2f}%)")
print(f"Total y_proxy normal: {(y_proxy == 0).sum()} ({(y_proxy == 0).mean()*100:.2f}%)")

# Stages:
# Stage 1: Raw Uncalibrated Baseline (default sklearn threshold 0.0, or predict() == -1)
# Note: model.predict(X_scaled) flags as -1 when decision_function < 0
s1_pred = (dec_scores < 0.0).astype(int)
tp1 = int(np.sum((s1_pred == 1) & (y_proxy == 1)))
tn1 = int(np.sum((s1_pred == 0) & (y_proxy == 0)))
fp1 = int(np.sum((s1_pred == 1) & (y_proxy == 0)))
fn1 = int(np.sum((s1_pred == 0) & (y_proxy == 1)))
prec1 = tp1 / (tp1 + fp1) * 100
rec1 = tp1 / (tp1 + fn1) * 100
acc1 = (tp1 + tn1) / len(y_proxy) * 100
f1_1 = 2 * prec1 * rec1 / (prec1 + rec1)
auc1 = roc_auc_score(y_proxy, -dec_scores) * 100

print("\n--- STAGE 1 (Raw Baseline) ---")
print(f"TP: {tp1}, FP: {fp1}, FN: {fn1}, TN: {tn1}")
print(f"Prec: {prec1:.2f}%, Rec: {rec1:.2f}%, Acc: {acc1:.2f}%, F1: {f1_1:.2f}%, ROC-AUC: {auc1:.2f}%")

# Stage 2: Empirical Boundary Calibrated (tau = -0.0150 or similar)
# Let's check pure decision_scores < -0.0150 or with simple rule
# In paper: Stage 2 has TP=83,739, FP=18,376, FN=26,367, TN=250,058
# Let's see what threshold gives that
s2_flag = (dec_scores < -0.0150) | (cost_per_day > 500.0) | (mat_ratio > 0.55) | (adm_ratio > 0.14)
# What was Stage 2 exactly? Let's check different variants
print("\n--- STAGE 2 variants ---")
for t in [-0.015, -0.012, 0.0]:
    p = (dec_scores < t).astype(int)
    _tp = int(np.sum((p == 1) & (y_proxy == 1)))
    _fp = int(np.sum((p == 1) & (y_proxy == 0)))
    _fn = int(np.sum((p == 0) & (y_proxy == 1)))
    _tn = int(np.sum((p == 0) & (y_proxy == 0)))
    print(f"Pure dec_scores < {t}: TP={_tp}, FP={_fp}, FN={_fn}, TN={_tn}, Prec={_tp/(_tp+_fp)*100:.2f}%, Rec={_tp/(_tp+_fn)*100:.2f}%, Acc={(_tp+_tn)/len(y_proxy)*100:.2f}%")

p_v2 = ((dec_scores < -0.0150) | (cost_per_day > 500.0) | (mat_ratio > 0.55) | (adm_ratio > 0.14)).astype(int)
_tp = int(np.sum((p_v2 == 1) & (y_proxy == 1)))
_fp = int(np.sum((p_v2 == 1) & (y_proxy == 0)))
_fn = int(np.sum((p_v2 == 0) & (y_proxy == 1)))
_tn = int(np.sum((p_v2 == 0) & (y_proxy == 0)))
print(f"Stage 2 (boundary + statutory safety net): TP={_tp}, FP={_fp}, FN={_fn}, TN={_tn}, Prec={_tp/(_tp+_fp)*100:.2f}%, Rec={_tp/(_tp+_fn)*100:.2f}%, Acc={(_tp+_tn)/len(y_proxy)*100:.2f}%")

# Stage 3: High-Confidence Enterprise Mode (model_service.predict logic)
# (decision_scores < -0.0150 & conf) | cost>500 | mat>0.55 | adm>0.14
conf = (mat_ratio > 0.38) | (adm_ratio > 0.09) | (cost_per_day > 420.0)
s3_pred = (((dec_scores < -0.0150) & conf) | (cost_per_day > 500.0) | (mat_ratio > 0.55) | (adm_ratio > 0.14)).astype(int)
tp3 = int(np.sum((s3_pred == 1) & (y_proxy == 1)))
tn3 = int(np.sum((s3_pred == 0) & (y_proxy == 0)))
fp3 = int(np.sum((s3_pred == 1) & (y_proxy == 0)))
fn3 = int(np.sum((s3_pred == 0) & (y_proxy == 1)))
prec3 = tp3 / (tp3 + fp3) * 100
rec3 = tp3 / (tp3 + fn3) * 100
acc3 = (tp3 + tn3) / len(y_proxy) * 100
f1_3 = 2 * prec3 * rec3 / (prec3 + rec3)
auc3 = roc_auc_score(y_proxy, -dec_scores) * 100

print("\n--- STAGE 3 (High-Confidence Enterprise Mode) ---")
print(f"TP: {tp3}, FP: {fp3}, FN: {fn3}, TN: {tn3}")
print(f"Prec: {prec3:.2f}%, Rec: {rec3:.2f}%, Acc: {acc3:.2f}%, F1: {f1_3:.2f}%, ROC-AUC: {auc3:.2f}%")

