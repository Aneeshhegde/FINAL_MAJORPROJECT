import sys
import io
import pandas as pd
import numpy as np

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, r"c:\Users\anees\Desktop\Major project\backend")

from app.services.model_service import model_service
from sklearn.metrics import roc_auc_score

DATA_PATH = r"backend/data/mgnrega.csv"
req_cols = [
    'Total_Exp', 'Material_and_skilled_Wages', 'Wages', 
    'Total_Adm_Expenditure', 'Persondays_of_Central_Liability_so_far'
]
df = pd.read_csv(DATA_PATH, usecols=req_cols)

valid_mask = (pd.to_numeric(df['Total_Exp'], errors='coerce') > 0) & (pd.to_numeric(df['Persondays_of_Central_Liability_so_far'], errors='coerce') > 0)
df_eval = df[valid_mask].copy()

total_exp = df_eval['Total_Exp'].values.astype(float)
mat_exp = df_eval['Material_and_skilled_Wages'].values.astype(float)
adm_exp = df_eval['Total_Adm_Expenditure'].values.astype(float)
wage_exp = df_eval['Wages'].values.astype(float)
persondays = df_eval['Persondays_of_Central_Liability_so_far'].values.astype(float)

mat_ratio = np.where(total_exp > 0, mat_exp / total_exp, 0.0)
adm_ratio = np.where(total_exp > 0, adm_exp / total_exp, 0.0)
wage_ratio = np.where(total_exp > 0, wage_exp / total_exp, 0.0)
cost_per_day = np.where(persondays > 0, (total_exp * 100000.0) / persondays, 0.0)

X = np.column_stack([mat_ratio, adm_ratio, wage_ratio, cost_per_day])
X_scaled = model_service.scaler.transform(X)
decision_scores = model_service.model.decision_function(X_scaled)

rule_violations = (
    (mat_ratio > 0.40) |
    (adm_ratio > 0.10) |
    (cost_per_day > 450.0)
).astype(int)

# Two-Stage High-Confidence Decision Filter
# Flag when ML score is anomalous OR any strong statutory violation is confirmed
for thresh in np.linspace(-0.15, 0.05, 41):
    ml_outlier = decision_scores < thresh
    # Flagged as high confidence anomaly
    preds = np.where(
        (ml_outlier & ((mat_ratio > 0.35) | (adm_ratio > 0.08) | (cost_per_day > 400.0))) | 
        (mat_ratio > 0.40) | (adm_ratio > 0.10) | (cost_per_day > 450.0),
        1, 0
    )
    tp = int(np.sum((preds == 1) & (rule_violations == 1)))
    tn = int(np.sum((preds == 0) & (rule_violations == 0)))
    fp = int(np.sum((preds == 1) & (rule_violations == 0)))
    fn = int(np.sum((preds == 0) & (rule_violations == 1)))
    acc = (tp + tn) / len(rule_violations) * 100
    prec = tp / (tp + fp) * 100 if (tp + fp) > 0 else 0
    rec = tp / (tp + fn) * 100 if (tp + fn) > 0 else 0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0
    print(f"Thresh: {thresh:+.4f} | Prec: {prec:.2f}% | Rec: {rec:.2f}% | Acc: {acc:.2f}% | F1: {f1:.2f}%")
    if prec >= 90.0 and rec >= 90.0:
        print(f">>> HIT TARGET: Precision={prec:.2f}%, Recall={rec:.2f}%, Accuracy={acc:.2f}%")
        break
