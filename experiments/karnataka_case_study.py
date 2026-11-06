"""
GovGuard AI: Karnataka Case Study & Visualization Suite
Implements:
- Part A: Original record-level evaluation
- Part B: Corrected district-level aggregation via ratio-of-sums of final cumulative snapshots
- Part C: Multi-seed Isolation Forest fit on 31 district aggregate vectors (noting n=31 limitation)
Generates publication-quality 300 DPI greyscale-readable figures into figures_v2/
"""

import sys
import argparse
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from experiments.config import (
    MATERIAL_LABEL, MATERIAL_CONF, MATERIAL_BREACH,
    COST_LABEL, COST_CONF, COST_BREACH,
    ADMIN_SETTINGS, SEEDS
)

DATA_PATH = PROJECT_ROOT / "backend" / "data" / "mgnrega.csv"
MODEL_PATH = PROJECT_ROOT / "backend" / "ml" / "isolation_forest.pkl"
SCALER_PATH = PROJECT_ROOT / "backend" / "ml" / "scaler.pkl"
FIG_DIR = PROJECT_ROOT / "figures_v2"

def calculate_risk_score(d_val, mat_ratio, adm_ratio, cost_per_day, admin_key):
    base_score = np.clip(50.0 - (d_val * 135.0), 0.0, 100.0)
    score = float(base_score)
    adm_breach = ADMIN_SETTINGS[admin_key]["breach"]
    if cost_per_day > COST_BREACH:
        score = max(score, 65.0 + min(30.0, (cost_per_day - 550.0) / 15.0))
    if mat_ratio > MATERIAL_BREACH:
        score = max(score, 70.0 + min(25.0, (mat_ratio - 0.60) * 80.0))
    if adm_ratio > adm_breach:
        score = max(score, 72.0 + min(25.0, (adm_ratio - (adm_breach + 0.01)) * 100.0))
    return min(100.0, max(0.0, score))

def run_karnataka_analysis(admin="admin10"):
    print("=" * 80)
    print(f"  GOVGUARD AI: KARNATAKA AUDIT & CASE STUDY — ADMIN SETTING: {admin.upper()}")
    print("=" * 80)
    
    out_dir = PROJECT_ROOT / "results_v2" / admin
    out_dir.mkdir(parents=True, exist_ok=True)
    FIG_DIR.mkdir(parents=True, exist_ok=True)
    
    admin_cfg = ADMIN_SETTINGS[admin]
    admin_label = admin_cfg["label"]
    admin_conf = admin_cfg["conf"]
    admin_breach = admin_cfg["breach"]
    
    print("\n[Part A: Ingesting Karnataka Records]")
    df_raw = pd.read_csv(DATA_PATH, low_memory=False)
    kar_mask = df_raw['state_name'].astype(str).str.upper() == 'KARNATAKA'
    kar_df = df_raw[kar_mask].copy()
    
    kar_df['Total_Exp'] = pd.to_numeric(kar_df['Total_Exp'], errors='coerce').fillna(0.0)
    kar_df['Persondays_of_Central_Liability_so_far'] = pd.to_numeric(kar_df['Persondays_of_Central_Liability_so_far'], errors='coerce').fillna(0.0)
    kar_df['Material_and_skilled_Wages'] = pd.to_numeric(kar_df['Material_and_skilled_Wages'], errors='coerce').fillna(0.0)
    kar_df['Total_Adm_Expenditure'] = pd.to_numeric(kar_df['Total_Adm_Expenditure'], errors='coerce').fillna(0.0)
    kar_df['Wages'] = pd.to_numeric(kar_df['Wages'], errors='coerce').fillna(0.0)
    
    valid_mask = (kar_df['Total_Exp'] > 0) & (kar_df['Persondays_of_Central_Liability_so_far'] > 0)
    kar_valid = kar_df[valid_mask].copy()
    print(f"  • Karnataka Raw Records:      {len(kar_df):,}")
    print(f"  • Valid Positive Records:     {len(kar_valid):,}")
    print(f"  • Unique District Codes:      {kar_valid['district_code'].nunique()}")
    
    # Part A: Record-level Flagging using Original Model
    print("\n  Evaluating Record-Level Flags using Original Model...")
    orig_model = joblib.load(MODEL_PATH)
    orig_scaler = joblib.load(SCALER_PATH)
    
    tot_rec = kar_valid['Total_Exp'].values
    pdays_rec = kar_valid['Persondays_of_Central_Liability_so_far'].values
    mat_rec = kar_valid['Material_and_skilled_Wages'].values
    adm_rec = kar_valid['Total_Adm_Expenditure'].values
    wag_rec = kar_valid['Wages'].values
    
    r_x1 = mat_rec / tot_rec
    r_x2 = adm_rec / tot_rec
    r_x3 = wag_rec / tot_rec
    r_x4 = (tot_rec * 100000.0) / pdays_rec
    
    X_rec = np.column_stack([r_x1, r_x2, r_x3, r_x4])
    X_rec_scaled = orig_scaler.transform(X_rec)
    d_rec = orig_model.decision_function(X_rec_scaled)
    
    rec_conf = (r_x1 > MATERIAL_CONF) | (r_x2 > admin_conf) | (r_x4 > COST_CONF)
    rec_stat = (r_x4 > COST_BREACH) | (r_x1 > MATERIAL_BREACH) | (r_x2 > admin_breach)
    rec_flag = ((d_rec < -0.0150) & rec_conf) | rec_stat
    
    kar_valid['rec_flag'] = rec_flag.astype(int)
    
    # Calculate pct_records_flagged per district_code
    dist_rec_stats = kar_valid.groupby('district_code').agg(
        total_recs=('rec_flag', 'count'),
        flagged_recs=('rec_flag', 'sum')
    ).reset_index()
    dist_rec_stats['pct_records_flagged'] = (dist_rec_stats['flagged_recs'] / dist_rec_stats['total_recs']) * 100.0
    rec_pct_map = dict(zip(dist_rec_stats['district_code'], dist_rec_stats['pct_records_flagged']))
    
    # Part B (corrected): Ratio-of-sums of final cumulative snapshots
    print("\n[Part B: Corrected Ratio-of-Sums District Aggregation]")
    print("  • Taking row with max Persondays per (district_code, fin_year)...")
    idx_max = kar_valid.groupby(['district_code', 'fin_year'])['Persondays_of_Central_Liability_so_far'].idxmax()
    kar_snapshots = kar_valid.loc[idx_max].copy()
    print(f"  • Total annual snapshots extracted: {len(kar_snapshots):,}")
    
    # Standardize district name (use most frequent or latest name per district_code)
    dist_names = kar_snapshots.groupby('district_code')['district_name'].agg(lambda s: s.mode()[0] if not s.mode().empty else s.iloc[0]).to_dict()
    
    # Sum over financial years per district_code
    dist_agg = kar_snapshots.groupby('district_code').agg({
        'Total_Exp': 'sum',
        'Persondays_of_Central_Liability_so_far': 'sum',
        'Material_and_skilled_Wages': 'sum',
        'Total_Adm_Expenditure': 'sum',
        'Wages': 'sum'
    }).reset_index()
    
    dist_agg['district'] = dist_agg['district_code'].map(dist_names)
    n_districts = len(dist_agg)
    print(f"  • Aggregated to {n_districts} districts.")
    
    tot_sum = dist_agg['Total_Exp'].values
    pdays_sum = dist_agg['Persondays_of_Central_Liability_so_far'].values
    mat_sum = dist_agg['Material_and_skilled_Wages'].values
    adm_sum = dist_agg['Total_Adm_Expenditure'].values
    wag_sum = dist_agg['Wages'].values
    
    x1 = mat_sum / tot_sum
    x2 = adm_sum / tot_sum
    x3 = wag_sum / tot_sum
    x4 = (tot_sum * 100000.0) / pdays_sum
    
    X_dist = np.column_stack([x1, x2, x3, x4])
    
    # Part C: Fit NEW IsolationForest on 31 corrected district vectors
    print("\n[Part C: Modeling Corrected District Vectors]")
    print("  > NOTE & CAVEAT: Sample size n=31 is small for training an Isolation Forest.")
    print("  > Results are evaluated across seeds 42..46 to quantify model stability.")
    
    # Scale 31 district vectors
    scaler_dist = StandardScaler()
    X_dist_scaled = scaler_dist.fit_transform(X_dist)
    
    d_matrix = np.zeros((len(SEEDS), n_districts))
    flag_matrix = np.zeros((len(SEEDS), n_districts))
    
    conf_dist = ((x1 > MATERIAL_CONF) | (x2 > admin_conf) | (x4 > COST_CONF))
    stat_dist = ((x4 > COST_BREACH) | (x1 > MATERIAL_BREACH) | (x2 > admin_breach))
    
    for s_idx, seed in enumerate(SEEDS):
        if_dist = IsolationForest(n_estimators=100, contamination=0.07, random_state=seed)
        if_dist.fit(X_dist_scaled)
        d_scores = if_dist.decision_function(X_dist_scaled)
        d_matrix[s_idx, :] = d_scores
        # Flag condition: d(x) < 0 with statutory confirmation, or direct statutory breach
        flag_seed = ((d_scores < 0.0) & conf_dist) | stat_dist
        flag_matrix[s_idx, :] = flag_seed.astype(int)
        
    mean_d = np.mean(d_matrix, axis=0)
    flag_frequency = np.mean(flag_matrix, axis=0)
    majority_flag = (flag_frequency >= 0.5).astype(int)
    
    risk_scores = [calculate_risk_score(mean_d[i], x1[i], x2[i], x4[i], admin) for i in range(n_districts)]
    
    pct_rec_flagged = [rec_pct_map.get(code, 0.0) for code in dist_agg['district_code']]
    
    table_df = pd.DataFrame({
        "district": dist_agg['district'],
        "x1": np.round(x1, 4),
        "x2": np.round(x2, 4),
        "x3": np.round(x3, 4),
        "x4": np.round(x4, 2),
        "risk_score_new_model": np.round(risk_scores, 1),
        "Conf": conf_dist.astype(int),
        "StatBreach": stat_dist.astype(int),
        "Flag": majority_flag,
        "flag_frequency_across_seeds": np.round(flag_frequency, 2),
        "pct_records_flagged": np.round(pct_rec_flagged, 2)
    })
    
    table_df.sort_values(by="risk_score_new_model", ascending=False, inplace=True)
    table_csv_path = out_dir / "karnataka_corrected_table.csv"
    table_df.to_csv(table_csv_path, index=False)
    print(f"\nSaved corrected Karnataka table to: {table_csv_path}")
    print("\nTop 10 Highest Risk Districts in Karnataka (Corrected Aggregation):")
    print(table_df[["district", "x1", "x2", "x4", "risk_score_new_model", "Conf", "StatBreach", "Flag", "pct_records_flagged"]].head(10).to_string(index=False))
    
    # -------------------------------------------------------------
    # GENERATE PUBLICATION FIGURES (300 DPI, GREYSCALE-READABLE)
    # -------------------------------------------------------------
    print("\n[Generating Publication Figures into figures_v2/]")
    
    # Figure 1: Scatter x1 vs x4
    fig, ax = plt.subplots(figsize=(8, 6), dpi=300)
    
    flagged_mask = table_df["Flag"] == 1
    unflagged_mask = table_df["Flag"] == 0
    
    ax.scatter(
        table_df.loc[unflagged_mask, "x1"],
        table_df.loc[unflagged_mask, "x4"],
        color="black",
        facecolors="white",
        edgecolors="black",
        s=70,
        marker="o",
        linewidths=1.5,
        label="Compliant District (Normal)",
        zorder=3
    )
    ax.scatter(
        table_df.loc[flagged_mask, "x1"],
        table_df.loc[flagged_mask, "x4"],
        color="black",
        facecolors="black",
        s=90,
        marker="D",
        label="Flagged District (Anomaly / Breach)",
        zorder=4
    )
    
    # Statutory Reference Lines
    ax.axvline(0.40, color="gray", linestyle="--", linewidth=1.5, label="Statutory Material Limit (40%)")
    ax.axhline(450.0, color="dimgray", linestyle=":", linewidth=1.5, label="Unit Cost Benchmark (₹450/day)")
    ax.axhline(500.0, color="black", linestyle="-.", linewidth=1.5, label="Statutory Breach Ceiling (₹500/day)")
    
    # Label key outlier districts
    for _, r in table_df.head(5).iterrows():
        ax.annotate(
            r["district"],
            (r["x1"], r["x4"]),
            textcoords="offset points",
            xytext=(6, 4),
            fontsize=8,
            fontweight="bold"
        )
        
    ax.set_xlabel("Material Expenditure Ratio (x1)", fontsize=11, fontweight="bold")
    ax.set_ylabel("Unit Cost per Personday in ₹ (x4)", fontsize=11, fontweight="bold")
    ax.set_title(f"Karnataka District Analysis: Material Ratio vs. Cost/Personday ({admin.upper()})", fontsize=12, fontweight="bold")
    ax.grid(True, linestyle=":", alpha=0.5)
    ax.legend(frameon=True, facecolor="white", edgecolor="black", fontsize=9, loc="upper left")
    plt.tight_layout()
    scatter_fig_path = FIG_DIR / f"scatter_x1_vs_x4_{admin}.png"
    plt.savefig(scatter_fig_path, dpi=300)
    # Also save standard name for the primary run
    if admin == "admin10":
        plt.savefig(FIG_DIR / "scatter_x1_vs_x4.png", dpi=300)
    plt.close()
    print(f"  • Saved scatter plot to: {scatter_fig_path}")
    
    # Figure 2: Correlation Heatmap
    fig, ax = plt.subplots(figsize=(7, 5.5), dpi=300)
    feat_df = pd.DataFrame(X_dist, columns=[
        "x1 (Material)", "x2 (Admin)", "x3 (Wages)", "x4 (Cost/Day)"
    ])
    corr_mat = feat_df.corr()
    
    # Use greyscale colormap with clear annotations
    sns.heatmap(
        corr_mat,
        annot=True,
        fmt=".2f",
        cmap="Greys",
        vmin=-1.0,
        vmax=1.0,
        cbar_kws={'label': 'Pearson Correlation Coefficient'},
        linewidths=1.0,
        linecolor="black",
        annot_kws={"fontsize": 11, "fontweight": "bold"},
        ax=ax
    )
    ax.set_title(f"Statutory Feature Correlation Heatmap (Karnataka Districts)", fontsize=12, fontweight="bold")
    plt.tight_layout()
    corr_fig_path = FIG_DIR / f"correlation_heatmap_{admin}.png"
    plt.savefig(corr_fig_path, dpi=300)
    if admin == "admin10":
        plt.savefig(FIG_DIR / "correlation_heatmap.png", dpi=300)
    plt.close()
    print(f"  • Saved correlation heatmap to: {corr_fig_path}")
    
    # Figure 3: Ablation F1 Bar Chart with Error Bars (if ablation_test.csv exists)
    ablation_csv = out_dir / "ablation_test.csv"
    if ablation_csv.exists():
        abl_df = pd.read_csv(ablation_csv)
        fig, ax = plt.subplots(figsize=(9, 5.5), dpi=300)
        
        cfg_labels = [
            "Rules Only\n(StatBreach)",
            "IF Only\n(d < tau)",
            "IF + Conf",
            "Full Hybrid\n(GovGuard AI)",
            "Conf Only\n(No ML)"
        ]
        
        f1_means = abl_df["mean_f1"].values
        f1_stds = abl_df["std_f1"].values
        
        # Greyscale hatch patterns and colors
        colors = ["#e0e0e0", "#cccccc", "#aaaaaa", "#444444", "#777777"]
        hatches = ["//", "\\\\", "xx", "**", ".."]
        
        bars = ax.bar(cfg_labels, f1_means, yerr=f1_stds, capsize=5, color=colors, edgecolor="black", linewidth=1.2)
        for b, h in zip(bars, hatches):
            b.set_hatch(h)
            
        for i, (m_val, s_val) in enumerate(zip(f1_means, f1_stds)):
            ax.text(i, m_val + s_val + 1.2, f"{m_val:.1f}%\n(±{s_val:.1f})", ha="center", va="bottom", fontsize=9, fontweight="bold")
            
        ax.set_ylabel("F1-Score on Test Set (%)", fontsize=11, fontweight="bold")
        ax.set_ylim(0, 105)
        ax.set_title(f"Ablation Analysis: Model Architecture Comparison ({admin.upper()})", fontsize=12, fontweight="bold")
        ax.grid(axis="y", linestyle=":", alpha=0.5)
        plt.tight_layout()
        abl_fig_path = FIG_DIR / f"ablation_f1_barchart_{admin}.png"
        plt.savefig(abl_fig_path, dpi=300)
        if admin == "admin10":
            plt.savefig(FIG_DIR / "ablation_f1_barchart.png", dpi=300)
        plt.close()
        print(f"  • Saved ablation F1 bar chart to: {abl_fig_path}")
        
    print("=" * 80 + "\n")

def main():
    parser = argparse.ArgumentParser(description="Karnataka Case Study & Visualizations")
    parser.add_argument("--admin", choices=["admin10", "admin6"], default="admin10", help="Admin setting")
    args = parser.parse_args()
    run_karnataka_analysis(admin=args.admin)

if __name__ == "__main__":
    main()

