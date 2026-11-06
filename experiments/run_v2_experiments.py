"""
GovGuard AI: V2 Multi-Seed Train/Val/Test Experimental Pipeline
Evaluates ablation across 5 random seeds on temporal splits:
  Train: 2018-2019 to 2023-2024
  Val:   2024-2025 (tau threshold calibration)
  Test:  2025-2026 (independent evaluation)
Supports admin10 and admin6 statutory settings and optional deduplication.
"""

import os
import sys
import json
import argparse
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, roc_auc_score

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from experiments.config import (
    MATERIAL_LABEL, MATERIAL_CONF, MATERIAL_BREACH,
    COST_LABEL, COST_CONF, COST_BREACH,
    ADMIN_SETTINGS, SEEDS, TRAIN_FY, VAL_FY, TEST_FY
)

DATA_PATH = PROJECT_ROOT / "backend" / "data" / "mgnrega.csv"

def compute_metrics(y_true, pred_binary, scores_for_auc=None):
    cm = confusion_matrix(y_true, pred_binary, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
    prec = tp / (tp + fp) * 100.0 if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) * 100.0 if (tp + fn) > 0 else 0.0
    f1 = (2.0 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
    acc = (tp + tn) / len(y_true) * 100.0
    fpr = fp / (fp + tn) * 100.0 if (fp + tn) > 0 else 0.0
    
    if scores_for_auc is not None:
        try:
            auc = roc_auc_score(y_true, scores_for_auc) * 100.0
        except Exception:
            auc = np.nan
    else:
        auc = np.nan
        
    return {
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "accuracy": acc,
        "fpr": fpr,
        "roc_auc": auc,
        "tp": int(tp),
        "fp": int(fp),
        "fn": int(fn),
        "tn": int(tn)
    }

def calculate_risk_score(d_val, mat_ratio, adm_ratio, cost_per_day, admin_key):
    """Calculates continuous 0-100 risk score and categorical level."""
    base_score = np.clip(50.0 - (d_val * 135.0), 0.0, 100.0)
    score = float(base_score)
    
    # Statutory breach overrides
    adm_breach = ADMIN_SETTINGS[admin_key]["breach"]
    if cost_per_day > COST_BREACH:
        score = max(score, 65.0 + min(30.0, (cost_per_day - 550.0) / 15.0))
    if mat_ratio > MATERIAL_BREACH:
        score = max(score, 70.0 + min(25.0, (mat_ratio - 0.60) * 80.0))
    if adm_ratio > adm_breach:
        score = max(score, 72.0 + min(25.0, (adm_ratio - (adm_breach + 0.01)) * 100.0))
        
    final_score = min(100.0, max(0.0, score))
    if final_score >= 75.0:
        level = "CRITICAL"
    elif final_score >= 55.0:
        level = "HIGH"
    elif final_score >= 35.0:
        level = "MEDIUM"
    else:
        level = "LOW"
    return final_score, level

def run_pipeline(admin="admin10", dedupe=True):
    print("=" * 80)
    print(f"  GOVGUARD AI: V2 EXPERIMENTS PIPELINE — ADMIN SETTING: {admin.upper()} (Dedupe={dedupe})")
    print("=" * 80)
    
    admin_cfg = ADMIN_SETTINGS[admin]
    admin_label = admin_cfg["label"]
    admin_conf = admin_cfg["conf"]
    admin_breach = admin_cfg["breach"]
    
    out_dir = PROJECT_ROOT / "results_v2" / admin
    out_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n[1/5] Loading and Filtering Dataset from {DATA_PATH}...")
    df_raw = pd.read_csv(DATA_PATH, low_memory=False)
    raw_len = len(df_raw)
    
    if dedupe:
        df_raw = df_raw.drop_duplicates()
        print(f"  • Exact duplicates dropped: {raw_len - len(df_raw):,}")
        
    tot_exp = pd.to_numeric(df_raw['Total_Exp'], errors='coerce')
    persondays = pd.to_numeric(df_raw['Persondays_of_Central_Liability_so_far'], errors='coerce')
    valid_mask = (tot_exp > 0) & (persondays > 0)
    df = df_raw[valid_mask].copy()
    print(f"  • Filtered cohort size: {len(df):,} records")
    
    tot_e = tot_exp[valid_mask].values.astype(np.float64)
    pdays_e = persondays[valid_mask].values.astype(np.float64)
    mat_e = pd.to_numeric(df['Material_and_skilled_Wages'], errors='coerce').fillna(0).values.astype(np.float64)
    adm_e = pd.to_numeric(df['Total_Adm_Expenditure'], errors='coerce').fillna(0).values.astype(np.float64)
    wag_e = pd.to_numeric(df['Wages'], errors='coerce').fillna(0).values.astype(np.float64)
    
    x1 = mat_e / tot_e
    x2 = adm_e / tot_e
    x3 = wag_e / tot_e
    x4 = (tot_e * 100000.0) / pdays_e
    X = np.column_stack([x1, x2, x3, x4])
    
    # Ground truth proxy labels, Conf, and StatBreach
    y_all = ((x1 > MATERIAL_LABEL) | (x2 > admin_label) | (x4 > COST_LABEL)).astype(int)
    conf_all = ((x1 > MATERIAL_CONF) | (x2 > admin_conf) | (x4 > COST_CONF))
    stat_all = ((x4 > COST_BREACH) | (x1 > MATERIAL_BREACH) | (x2 > admin_breach))
    
    fin_years = df['fin_year'].astype(str).values
    train_mask = np.isin(fin_years, TRAIN_FY)
    val_mask = np.isin(fin_years, VAL_FY)
    test_mask = np.isin(fin_years, TEST_FY)
    
    print(f"\n[2/5] Temporal Split Counts:")
    print(f"  • Train ({len(TRAIN_FY)} FYs): {np.sum(train_mask):,} rows (Anomalies: {np.sum(y_all[train_mask]):,}, {np.mean(y_all[train_mask])*100:.2f}%)")
    print(f"  • Val   ({len(VAL_FY)} FYs): {np.sum(val_mask):,} rows (Anomalies: {np.sum(y_all[val_mask]):,}, {np.mean(y_all[val_mask])*100:.2f}%)")
    print(f"  • Test  ({len(TEST_FY)} FYs): {np.sum(test_mask):,} rows (Anomalies: {np.sum(y_all[test_mask]):,}, {np.mean(y_all[test_mask])*100:.2f}%)")
    
    X_train, y_train = X[train_mask], y_all[train_mask]
    X_val, y_val = X[val_mask], y_all[val_mask]
    X_test, y_test = X[test_mask], y_all[test_mask]
    
    conf_val, stat_val = conf_all[val_mask], stat_all[val_mask]
    conf_test, stat_test = conf_all[test_mask], stat_all[test_mask]
    
    # Standardize based on Train split
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    configs = [
        "Rules only (StatBreach)",
        "IF only (d < tau)",
        "IF + Conf",
        "Full hybrid ((IF & Conf) | StatBreach)",
        "Conf only (no ML)"
    ]
    
    seed_results = {cfg: [] for cfg in configs}
    tuned_taus = {}
    models = []
    
    print(f"\n[3/5] Iterating over 5 random seeds {SEEDS}...")
    for seed in SEEDS:
        print(f"  --- Running Seed {seed} ---")
        iforest = IsolationForest(n_estimators=100, contamination=0.07, random_state=seed, n_jobs=-1)
        iforest.fit(X_train_scaled)
        models.append(iforest)
        
        # Decision function on Val
        d_val = iforest.decision_function(X_val_scaled)
        
        # Grid search for optimal tau on validation set
        tau_candidates = np.linspace(-0.25, 0.25, 101)
        best_tau = 0.0
        best_f1_val = -1.0
        
        for tau in tau_candidates:
            # Full hybrid Flag on validation set
            flag_val = ((d_val < tau) & conf_val) | stat_val
            cm_val = confusion_matrix(y_val, flag_val, labels=[0, 1])
            tn_v, fp_v, fn_v, tp_v = cm_val.ravel()
            p_v = tp_v / (tp_v + fp_v) if (tp_v + fp_v) > 0 else 0.0
            r_v = tp_v / (tp_v + fn_v) if (tp_v + fn_v) > 0 else 0.0
            f1_v = (2 * p_v * r_v) / (p_v + r_v) if (p_v + r_v) > 0 else 0.0
            if f1_v > best_f1_val:
                best_f1_val = f1_v
                best_tau = tau
                
        tuned_taus[seed] = float(best_tau)
        print(f"    • Tuned tau on Val: {best_tau:.4f} (Val F1: {best_f1_val*100:.2f}%)")
        
        # Evaluate on Test split
        d_test = iforest.decision_function(X_test_scaled)
        auc_scores = -d_test
        
        preds_dict = {
            "Rules only (StatBreach)": stat_test.astype(int),
            "IF only (d < tau)": (d_test < best_tau).astype(int),
            "IF + Conf": ((d_test < best_tau) & conf_test).astype(int),
            "Full hybrid ((IF & Conf) | StatBreach)": (((d_test < best_tau) & conf_test) | stat_test).astype(int),
            "Conf only (no ML)": conf_test.astype(int)
        }
        
        for cfg in configs:
            p_bin = preds_dict[cfg]
            m = compute_metrics(y_test, p_bin, scores_for_auc=auc_scores)
            seed_results[cfg].append(m)
            
    # Calculate Mean ± Std across seeds
    ablation_rows = []
    print("\n[4/5] Test Set Ablation Results (Mean ± Std over 5 seeds):")
    print(f"{'Configuration':<42} | {'Precision (%)':<16} | {'Recall (%)':<16} | {'F1-Score (%)':<16} | {'Accuracy (%)':<16} | {'FPR (%)':<16} | {'ROC-AUC (%)':<16}")
    print("-" * 150)
    
    for cfg in configs:
        res_list = seed_results[cfg]
        prec_vals = [r["precision"] for r in res_list]
        rec_vals = [r["recall"] for r in res_list]
        f1_vals = [r["f1"] for r in res_list]
        acc_vals = [r["accuracy"] for r in res_list]
        fpr_vals = [r["fpr"] for r in res_list]
        auc_vals = [r["roc_auc"] for r in res_list]
        tp_vals = [r["tp"] for r in res_list]
        fp_vals = [r["fp"] for r in res_list]
        fn_vals = [r["fn"] for r in res_list]
        tn_vals = [r["tn"] for r in res_list]
        
        row_summary = {
            "Configuration": cfg,
            "Precision (%)": f"{np.mean(prec_vals):.2f} ± {np.std(prec_vals):.2f}",
            "Recall (%)": f"{np.mean(rec_vals):.2f} ± {np.std(rec_vals):.2f}",
            "F1-Score (%)": f"{np.mean(f1_vals):.2f} ± {np.std(f1_vals):.2f}",
            "Accuracy (%)": f"{np.mean(acc_vals):.2f} ± {np.std(acc_vals):.2f}",
            "FPR (%)": f"{np.mean(fpr_vals):.2f} ± {np.std(fpr_vals):.2f}",
            "ROC-AUC (%)": f"{np.mean(auc_vals):.2f} ± {np.std(auc_vals):.2f}",
            "TP": f"{int(round(np.mean(tp_vals)))}",
            "FP": f"{int(round(np.mean(fp_vals)))}",
            "FN": f"{int(round(np.mean(fn_vals)))}",
            "TN": f"{int(round(np.mean(tn_vals)))}",
            # Raw mean values for subsequent programmatic comparisons
            "mean_precision": float(np.mean(prec_vals)),
            "std_precision": float(np.std(prec_vals)),
            "mean_recall": float(np.mean(rec_vals)),
            "std_recall": float(np.std(rec_vals)),
            "mean_f1": float(np.mean(f1_vals)),
            "std_f1": float(np.std(f1_vals)),
            "mean_accuracy": float(np.mean(acc_vals)),
            "std_accuracy": float(np.std(acc_vals)),
            "mean_fpr": float(np.mean(fpr_vals)),
            "std_fpr": float(np.std(fpr_vals)),
            "mean_roc_auc": float(np.mean(auc_vals)),
            "std_roc_auc": float(np.std(auc_vals)),
            "mean_tp": float(np.mean(tp_vals)),
            "mean_fp": float(np.mean(fp_vals)),
            "mean_fn": float(np.mean(fn_vals)),
            "mean_tn": float(np.mean(tn_vals))
        }
        ablation_rows.append(row_summary)
        print(f"{cfg:<42} | {row_summary['Precision (%)']:<16} | {row_summary['Recall (%)']:<16} | {row_summary['F1-Score (%)']:<16} | {row_summary['Accuracy (%)']:<16} | {row_summary['FPR (%)']:<16} | {row_summary['ROC-AUC (%)']:<16}")

    ablation_df = pd.DataFrame(ablation_rows)
    ablation_csv_path = out_dir / "ablation_test.csv"
    ablation_df.to_csv(ablation_csv_path, index=False)
    print(f"\nSaved ablation table to: {ablation_csv_path}")
    
    # Save Hyperparameters JSON
    hyper_path = out_dir / "hyperparameters.json"
    hyperparams = {
        "admin_setting": admin,
        "dedupe": dedupe,
        "seeds": SEEDS,
        "n_estimators": 100,
        "contamination": 0.07,
        "tau_per_seed": tuned_taus,
        "mean_tau": float(np.mean(list(tuned_taus.values()))),
        "std_tau": float(np.std(list(tuned_taus.values()))),
        "train_financial_years": TRAIN_FY,
        "val_financial_years": VAL_FY,
        "test_financial_years": TEST_FY,
        "train_samples": int(np.sum(train_mask)),
        "val_samples": int(np.sum(val_mask)),
        "test_samples": int(np.sum(test_mask))
    }
    with open(hyper_path, "w", encoding="utf-8") as f:
        json.dump(hyperparams, f, indent=2)
    print(f"Saved hyperparameters to: {hyper_path}")
    
    # 5 Synthetic Stress Tests
    print("\n[5/5] Running Synthetic Fraud Stress Tests...")
    syn_cases = [
        {"Test Case": "Extreme Material Skew", "Injected Parameters": "Material Ratio = 85% (Limit 40%)", "Ground Truth": "Anomaly", "Paper Prediction & Score": "ANOMALY (95.0 / 100 CRITICAL)", "Total_Exp": 100.0, "Material_and_skilled_Wages": 85.0, "Total_Adm_Expenditure": 5.0, "Wages": 10.0, "Persondays_of_Central_Liability_so_far": 5000.0},
        {"Test Case": "Administrative Embezzlement", "Injected Parameters": f"Admin Ratio = 35% (Limit {int(admin_label*100)}%)", "Ground Truth": "Anomaly", "Paper Prediction & Score": "ANOMALY (95.0 / 100 CRITICAL)", "Total_Exp": 100.0, "Material_and_skilled_Wages": 20.0, "Total_Adm_Expenditure": 35.0, "Wages": 45.0, "Persondays_of_Central_Liability_so_far": 5000.0},
        {"Test Case": "Unit Cost Inflation", "Injected Parameters": "Cost/day = ₹1,450 (Limit ₹450)", "Ground Truth": "Anomaly", "Paper Prediction & Score": "ANOMALY (95.0 / 100 CRITICAL)", "Total_Exp": 1.0, "Material_and_skilled_Wages": 0.2, "Total_Adm_Expenditure": 0.02, "Wages": 0.78, "Persondays_of_Central_Liability_so_far": 69.0},
        {"Test Case": "Multi-Violation Budget Dump", "Injected Parameters": "Simultaneous Extreme Breaches", "Ground Truth": "Anomaly", "Paper Prediction & Score": "ANOMALY (95.0 / 100 CRITICAL)", "Total_Exp": 100.0, "Material_and_skilled_Wages": 80.0, "Total_Adm_Expenditure": 18.0, "Wages": 2.0, "Persondays_of_Central_Liability_so_far": 45.0},
        {"Test Case": "Honest Compliant Baseline", "Injected Parameters": f"Mat=22%, Admin=4%, ₹222/day", "Ground Truth": "Normal", "Paper Prediction & Score": "NORMAL (24.5 / 100 LOW RISK)", "Total_Exp": 10.0, "Material_and_skilled_Wages": 2.2, "Total_Adm_Expenditure": 0.4, "Wages": 7.4, "Persondays_of_Central_Liability_so_far": 4500.0}
    ]
    
    syn_rows = []
    # Evaluate stress cases across trained models using mean tau
    mean_tau = np.mean(list(tuned_taus.values()))
    for case in syn_cases:
        t_exp = case["Total_Exp"]
        m_exp = case["Material_and_skilled_Wages"]
        a_exp = case["Total_Adm_Expenditure"]
        w_exp = case["Wages"]
        p_days = case["Persondays_of_Central_Liability_so_far"]
        
        m_rat = m_exp / t_exp
        a_rat = a_exp / t_exp
        w_rat = w_exp / t_exp
        c_day = (t_exp * 100000.0) / p_days
        
        feat_vec = np.array([[m_rat, a_rat, w_rat, c_day]])
        feat_scaled = scaler.transform(feat_vec)
        
        # Average decision score across the 5 models
        d_scores = [m.decision_function(feat_scaled)[0] for m in models]
        d_mean = np.mean(d_scores)
        
        conf_flag = (m_rat > MATERIAL_CONF) | (a_rat > admin_conf) | (c_day > COST_CONF)
        stat_flag = (c_day > COST_BREACH) | (m_rat > MATERIAL_BREACH) | (a_rat > admin_breach)
        flag = ((d_mean < mean_tau) and conf_flag) or stat_flag
        
        score, lvl = calculate_risk_score(d_mean, m_rat, a_rat, c_day, admin)
        pred_label = "Anomaly" if flag else "Normal"
        status = "PASS" if pred_label == case["Ground Truth"] else "FAIL"
        
        actual_str = f"{'ANOMALY' if flag else 'NORMAL'} ({score:.1f} / 100 {lvl})"
        print(f"  [{status}] {case['Test Case']:<28} -> {actual_str} (Ground Truth: {case['Ground Truth']})")
        
        syn_rows.append({
            "Test Case": case["Test Case"],
            "Injected Parameters": case["Injected Parameters"],
            "Ground Truth": case["Ground Truth"],
            "Paper Prediction & Score": case["Paper Prediction & Score"],
            "Actual Prediction & Score": actual_str,
            "Flag": int(flag),
            "Risk Score": round(score, 1),
            "Risk Level": lvl,
            "Status": status
        })
        
    stress_df = pd.DataFrame(syn_rows)
    stress_csv_path = out_dir / "stress_test.csv"
    stress_df.to_csv(stress_csv_path, index=False)
    print(f"Saved stress test results to: {stress_csv_path}")
    print("=" * 80 + "\n")

def main():
    parser = argparse.ArgumentParser(description="Run GovGuard AI V2 Experiments")
    parser.add_argument("--admin", choices=["admin10", "admin6"], default="admin10", help="Admin setting")
    parser.add_argument("--dedupe", action=argparse.BooleanOptionalAction, default=True, help="Deduplicate dataset before filtering")
    args = parser.parse_args()
    
    run_pipeline(admin=args.admin, dedupe=args.dedupe)

if __name__ == "__main__":
    main()

