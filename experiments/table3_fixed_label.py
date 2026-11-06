"""
GovGuard AI: Table 3 Fixed-Label Evaluation
Evaluates the original pre-trained Isolation Forest model and StandardScaler
across Stage 1 (Raw Baseline), Stage 2 (Calibrated Boundary), and Stage 3 (Enterprise Mode)
against fixed statutory ground-truth proxy labels for both admin10 and admin6 settings.
"""

import sys
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix, roc_auc_score

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from experiments.config import (
    MATERIAL_LABEL, MATERIAL_CONF, MATERIAL_BREACH,
    COST_LABEL, COST_CONF, COST_BREACH,
    ADMIN_SETTINGS
)

DATA_PATH = PROJECT_ROOT / "backend" / "data" / "mgnrega.csv"
MODEL_PATH = PROJECT_ROOT / "backend" / "ml" / "isolation_forest.pkl"
SCALER_PATH = PROJECT_ROOT / "backend" / "ml" / "scaler.pkl"
RESULTS_DIR = PROJECT_ROOT / "results_v2"

def compute_stage_metrics(y_true, pred, scores_for_auc):
    cm = confusion_matrix(y_true, pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
    prec = tp / (tp + fp) * 100.0 if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) * 100.0 if (tp + fn) > 0 else 0.0
    f1 = (2.0 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
    acc = (tp + tn) / len(y_true) * 100.0
    fpr = fp / (fp + tn) * 100.0 if (fp + tn) > 0 else 0.0
    auc = roc_auc_score(y_true, scores_for_auc) * 100.0
    
    return {
        "TP": int(tp),
        "FP": int(fp),
        "FN": int(fn),
        "TN": int(tn),
        "Precision (%)": prec,
        "Recall (%)": rec,
        "F1-Score (%)": f1,
        "Accuracy (%)": acc,
        "FPR (%)": fpr,
        "ROC-AUC (%)": auc
    }

def evaluate_admin_setting(admin_key, df, X_scaled, dec_scores, mat_ratio, adm_ratio, cost_per_day):
    admin_cfg = ADMIN_SETTINGS[admin_key]
    admin_label = admin_cfg["label"]
    admin_conf = admin_cfg["conf"]
    admin_breach = admin_cfg["breach"]
    
    # Ground truth proxy label
    y_true = ((mat_ratio > MATERIAL_LABEL) | (adm_ratio > admin_label) | (cost_per_day > COST_LABEL)).astype(int)
    
    # Statutory confirmation condition & extreme breaches
    conf = ((mat_ratio > MATERIAL_CONF) | (adm_ratio > admin_conf) | (cost_per_day > COST_CONF))
    stat_breach = ((cost_per_day > COST_BREACH) | (mat_ratio > MATERIAL_BREACH) | (adm_ratio > admin_breach))
    
    tau = -0.0150
    auc_scores = -dec_scores
    
    # Stage 1: Raw Baseline (d(x) < 0.0)
    s1_pred = (dec_scores < 0.0).astype(int)
    s1_m = compute_stage_metrics(y_true, s1_pred, auc_scores)
    
    # Stage 2: Empirical Boundary Calibrated (d(x) < -0.0150)
    s2_pred = (dec_scores < tau).astype(int)
    s2_m = compute_stage_metrics(y_true, s2_pred, auc_scores)
    
    # Stage 3: High-Confidence Enterprise Mode
    s3_pred = (((dec_scores < tau) & conf) | stat_breach).astype(int)
    s3_m = compute_stage_metrics(y_true, s3_pred, auc_scores)
    
    # Deeper inspection for Stage 3
    # 1. How many TPs come from StatBreach alone (StatBreach=True, d(x) >= tau)?
    tp_stat_alone = int(np.sum(stat_breach & (dec_scores >= tau) & (y_true == 1)))
    
    # 2. Precision of flags where Conf=True, StatBreach=False (ML-driven flags only)
    ml_only_flag = (dec_scores < tau) & conf & (~stat_breach)
    tp_ml = int(np.sum(ml_only_flag & (y_true == 1)))
    fp_ml = int(np.sum(ml_only_flag & (y_true == 0)))
    prec_ml = (tp_ml / (tp_ml + fp_ml) * 100.0) if (tp_ml + fp_ml) > 0 else 0.0
    
    print("=" * 85)
    print(f"  EVALUATION RESULTS FOR {admin_key.upper()} (Total Records: {len(y_true):,})")
    print(f"  Thresholds: Label={admin_label}, Conf={admin_conf}, Breach={admin_breach}")
    print("=" * 85)
    
    rows = [
        {"Stage": "Stage 1: Raw Baseline (d < 0)", **s1_m},
        {"Stage": "Stage 2: Calibrated Boundary (d < -0.0150)", **s2_m},
        {"Stage": "Stage 3: High-Confidence Enterprise", **s3_m}
    ]
    
    res_df = pd.DataFrame(rows)
    print(res_df.to_string(index=False))
    
    print("\nStage 3 Structural Audit Breakdown:")
    print(f"  • True Positives from StatBreach alone (StatBreach=True, d(x) >= {tau}): {tp_stat_alone:,} ({tp_stat_alone/s3_m['TP']*100:.2f}% of all TPs)")
    print(f"  • ML-Driven Flags (Conf=True, StatBreach=False): TP={tp_ml:,}, FP={fp_ml:,}, Precision={prec_ml:.2f}%")
    
    # CHECKPOINT Verification for admin10
    if admin_key == "admin10":
        expected = {"TP": 89037, "FP": 7826, "FN": 21069, "TN": 260608}
        actual = {"TP": s3_m["TP"], "FP": s3_m["FP"], "FN": s3_m["FN"], "TN": s3_m["TN"]}
        if actual != expected:
            raise AssertionError(
                f"\n[CRITICAL ERROR] CHECKPOINT MISMATCH for admin10 Stage 3!\n"
                f"Expected: {expected}\nActual:   {actual}\nHalting execution."
            )
        print("\n>>> [CHECKPOINT PASSED]: admin10 Stage 3 exactly matches TP=89037, FP=7826, FN=21069, TN=260608! <<<\n")
        
    out_csv = RESULTS_DIR / f"table3_{admin_key}.csv"
    res_df.to_csv(out_csv, index=False)
    print(f"Saved results to: {out_csv}\n")
    return res_df

def main():
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    print("Loading dataset and model artifacts...")
    df_raw = pd.read_csv(DATA_PATH, low_memory=False)
    
    tot_exp = pd.to_numeric(df_raw['Total_Exp'], errors='coerce')
    persondays = pd.to_numeric(df_raw['Persondays_of_Central_Liability_so_far'], errors='coerce')
    valid_mask = (tot_exp > 0) & (persondays > 0)
    df_eval = df_raw[valid_mask].copy()
    
    tot_e = tot_exp[valid_mask].values.astype(np.float64)
    pdays_e = persondays[valid_mask].values.astype(np.float64)
    mat_e = pd.to_numeric(df_eval['Material_and_skilled_Wages'], errors='coerce').fillna(0).values.astype(np.float64)
    adm_e = pd.to_numeric(df_eval['Total_Adm_Expenditure'], errors='coerce').fillna(0).values.astype(np.float64)
    wag_e = pd.to_numeric(df_eval['Wages'], errors='coerce').fillna(0).values.astype(np.float64)
    
    mat_ratio = mat_e / tot_e
    adm_ratio = adm_e / tot_e
    wage_ratio = wag_e / tot_e
    cost_per_day = (tot_e * 100000.0) / pdays_e
    
    X = np.column_stack([mat_ratio, adm_ratio, wage_ratio, cost_per_day])
    
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    
    X_scaled = scaler.transform(X)
    dec_scores = model.decision_function(X_scaled)
    
    evaluate_admin_setting("admin10", df_eval, X_scaled, dec_scores, mat_ratio, adm_ratio, cost_per_day)
    evaluate_admin_setting("admin6", df_eval, X_scaled, dec_scores, mat_ratio, adm_ratio, cost_per_day)

if __name__ == "__main__":
    main()

