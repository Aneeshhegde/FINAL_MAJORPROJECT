"""
GovGuard AI: Dataset Summary & Audit Statistics
Loads raw MGNREGA data, quantifies deduplication, applies positive expenditure filtering,
and calculates comprehensive descriptive statistics for statutory features.
"""

from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "backend" / "data" / "mgnrega.csv"
OUTPUT_DIR = PROJECT_ROOT / "results_v2"
OUTPUT_PATH = OUTPUT_DIR / "data_summary.txt"

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_lines = []
    
    def log(msg=""):
        print(msg)
        out_lines.append(str(msg))

    log("=" * 80)
    log("  GOVGUARD AI: DATASET AUDIT & SUMMARY REPORT (V2)")
    log("=" * 80)
    
    log(f"\n[1] Ingesting Raw Dataset: {DATA_PATH}")
    df_raw = pd.read_csv(DATA_PATH, low_memory=False)
    raw_rows = len(df_raw)
    log(f"  • Total raw records ingested:       {raw_rows:,}")
    
    # Drop exact duplicates BEFORE filtering
    df_dedup = df_raw.drop_duplicates()
    dedup_rows = len(df_dedup)
    dups_removed = raw_rows - dedup_rows
    log(f"  • Exact duplicate rows removed:     {dups_removed:,} ({dups_removed / raw_rows * 100:.4f}%)")
    log(f"  • Cohort post-deduplication:        {dedup_rows:,}")
    
    # Filter: Total_Exp > 0 AND Persondays_of_Central_Liability_so_far > 0
    tot_exp = pd.to_numeric(df_dedup['Total_Exp'], errors='coerce')
    persondays = pd.to_numeric(df_dedup['Persondays_of_Central_Liability_so_far'], errors='coerce')
    valid_mask = (tot_exp > 0) & (persondays > 0)
    
    df_filtered = df_dedup[valid_mask].copy()
    filtered_rows = len(df_filtered)
    removed_nonpositive = dedup_rows - filtered_rows
    log(f"  • Non-positive records removed:     {removed_nonpositive:,} ({removed_nonpositive / dedup_rows * 100:.2f}%)")
    log(f"  • Final usable analysis cohort:     {filtered_rows:,} ({filtered_rows / raw_rows * 100:.2f}% of raw)")
    
    # Count distinct districts using (state_code, district_code) tuple
    district_tuples = df_filtered[['state_code', 'district_code']].dropna().drop_duplicates()
    n_districts = len(district_tuples)
    log(f"\n[2] Spatial Coverage:")
    log(f"  • Distinct districts (state_code, district_code): {n_districts:,}")
    log(f"  • Distinct state codes:                           {df_filtered['state_code'].nunique():,}")
    
    # Per-FY row counts
    log(f"\n[3] Temporal Distribution by Financial Year:")
    fy_counts = df_filtered['fin_year'].value_counts().sort_index()
    for fy, count in fy_counts.items():
        log(f"  • {fy:<12}: {count:8,d} records ({count / filtered_rows * 100:5.2f}%)")
        
    # Mean rows per district-month
    # Grouping by (state_code, district_code, fin_year, month)
    grouped_dist_month_fy = df_filtered.groupby(['state_code', 'district_code', 'fin_year', 'month']).size()
    mean_rows_per_dist_month_fy = grouped_dist_month_fy.mean()
    median_rows_per_dist_month_fy = grouped_dist_month_fy.median()
    max_rows_per_dist_month_fy = grouped_dist_month_fy.max()
    
    # Grouping by (state_code, district_code, month) overall
    grouped_dist_month = df_filtered.groupby(['state_code', 'district_code', 'month']).size()
    mean_rows_per_dist_month = grouped_dist_month.mean()
    
    log(f"\n[4] Sampling Density per District-Month:")
    log(f"  • Mean records per (district, fin_year, month):   {mean_rows_per_dist_month_fy:.2f} (median: {median_rows_per_dist_month_fy:.0f}, max: {max_rows_per_dist_month_fy})")
    log(f"  • Mean records per (district, month) aggregated:  {mean_rows_per_dist_month:.2f}")
    
    # Compute features x1..x4
    tot = pd.to_numeric(df_filtered['Total_Exp'], errors='coerce').values.astype(np.float64)
    pdays = pd.to_numeric(df_filtered['Persondays_of_Central_Liability_so_far'], errors='coerce').values.astype(np.float64)
    mat = pd.to_numeric(df_filtered['Material_and_skilled_Wages'], errors='coerce').fillna(0).values.astype(np.float64)
    adm = pd.to_numeric(df_filtered['Total_Adm_Expenditure'], errors='coerce').fillna(0).values.astype(np.float64)
    wag = pd.to_numeric(df_filtered['Wages'], errors='coerce').fillna(0).values.astype(np.float64)
    
    x1 = mat / tot
    x2 = adm / tot
    x3 = wag / tot
    x4 = (tot * 100000.0) / pdays
    
    feats = {
        "x1 (Material Expenditure Ratio)": x1,
        "x2 (Admin Expenditure Ratio)": x2,
        "x3 (Wages Ratio)": x3,
        "x4 (Unit Cost per Personday ₹)": x4
    }
    
    log(f"\n[5] Descriptive Statistics of Statutory Features (x1..x4):")
    log(f"{'Feature':<35} | {'Min':>12} | {'Max':>15} | {'Mean':>12} | {'Median':>12}")
    log("-" * 95)
    for fname, arr in feats.items():
        min_v = np.min(arr)
        max_v = np.max(arr)
        mean_v = np.mean(arr)
        med_v = np.median(arr)
        log(f"{fname:<35} | {min_v:12.4f} | {max_v:15.4f} | {mean_v:12.4f} | {med_v:12.4f}")
        
    log("\n" + "=" * 80)
    log("  AUDIT SUMMARY GENERATED SUCCESSFULLY")
    log("=" * 80)
    
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines) + "\n")
    print(f"\nSummary successfully saved to: {OUTPUT_PATH}")

if __name__ == "__main__":
    main()

