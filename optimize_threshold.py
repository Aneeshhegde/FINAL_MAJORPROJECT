import sys
import io
import joblib
import pandas as pd
import numpy as np

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

MODEL_PATH = r"backend/ml/isolation_forest.pkl"
SCALER_PATH = r"backend/ml/scaler.pkl"
DATA_PATH = r"backend/data/mgnrega.csv"

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
df = pd.read_csv(DATA_PATH)

df['Total_Exp'] = pd.to_numeric(df['Total_Exp'], errors='coerce').fillna(0.0)
df['Material_and_skilled_Wages'] = pd.to_numeric(df['Material_and_skilled_Wages'], errors='coerce').fillna(0.0)
df['Wages'] = pd.to_numeric(df['Wages'], errors='coerce').fillna(0.0)
df['Total_Adm_Expenditure'] = pd.to_numeric(df['Total_Adm_Expenditure'], errors='coerce').fillna(0.0)
df['Persondays_of_Central_Liability_so_far'] = pd.to_numeric(df['Persondays_of_Central_Liability_so_far'], errors='coerce').fillna(0.0)

valid_mask = (df['Total_Exp'] > 0) & (df['Persondays_of_Central_Liability_so_far'] > 0)
df_eval = df[valid_mask].copy()

df_eval['material_ratio'] = df_eval['Material_and_skilled_Wages'] / df_eval['Total_Exp']
df_eval['admin_ratio'] = df_eval['Total_Adm_Expenditure'] / df_eval['Total_Exp']
df_eval['wage_ratio'] = df_eval['Wages'] / df_eval['Total_Exp']
df_eval['cost_per_day'] = df_eval['Total_Exp'] * 100000.0 / df_eval['Persondays_of_Central_Liability_so_far']

features = ['material_ratio', 'admin_ratio', 'wage_ratio', 'cost_per_day']
X = df_eval[features].fillna(0.0).values
X_scaled = scaler.transform(X)
decision_scores = model.decision_function(X_scaled)

rule_violations = (
    (df_eval['material_ratio'] > 0.40) |
    (df_eval['admin_ratio'] > 0.10) |
    (df_eval['cost_per_day'] > 450.0)
).astype(int).values

best_acc = 0.0
best_f1 = 0.0
best_thresh = 0.0

for thresh in np.linspace(-0.25, 0.25, 101):
    preds = (decision_scores < thresh).astype(int)
    tp = int(np.sum((preds == 1) & (rule_violations == 1)))
    tn = int(np.sum((preds == 0) & (rule_violations == 0)))
    fp = int(np.sum((preds == 1) & (rule_violations == 0)))
    fn = int(np.sum((preds == 0) & (rule_violations == 1)))
    acc = (tp + tn) / len(rule_violations) * 100
    prec = tp / (tp + fp) * 100 if (tp + fp) > 0 else 0
    rec = tp / (tp + fn) * 100 if (tp + fn) > 0 else 0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0
    if f1 > best_f1:
        best_f1 = f1
        best_thresh = thresh
        best_acc = acc
        best_prec = prec
        best_rec = rec

print(f"Optimal Threshold: {best_thresh:.4f}")
print(f"Improved Accuracy:  {best_acc:.2f}%")
print(f"Improved Precision: {best_prec:.2f}%")
print(f"Improved Recall:    {best_rec:.2f}%")
print(f"Improved F1-Score:  {best_f1:.2f}%")
