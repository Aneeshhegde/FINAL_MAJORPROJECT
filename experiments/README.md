# GovGuard AI: Experimental Reproducibility Guide (V2)

This directory contains the modernized, fully reproducible research pipeline for **GovGuard AI**, evaluating multi-stage statutory anomaly detection across administrative expense limits, multi-seed training, and spatial aggregations.

---

## 1. Directory Structure

```
experiments/
├── config.py                  # Central configuration of statutory thresholds, seeds, and FY splits
├── data_summary.py            # Dataset audit, deduplication, and feature descriptive statistics
├── run_v2_experiments.py      # Multi-seed (seeds 42-46) train/val/test ablation runner
├── table3_fixed_label.py      # Verification of pre-trained model on fixed statutory proxy labels
├── karnataka_case_study.py    # Ratio-of-sums district aggregation & visualization generator
└── README.md                  # Reproducibility instructions (this document)
```

Outputs are systematically saved to:
- `results_v2/` — CSV tables, JSON hyperparameters, and data summaries
- `figures_v2/` — 300 DPI greyscale-readable publication-quality figures

---

## 2. Experimental Pipeline Reproducibility

All scripts must be executed from the project root (`c:\Users\anees\Desktop\Major project` or current workspace root).

### Step 1: Data Summary and Audit
Ingests `backend/data/mgnrega.csv`, removes exact duplicate records, filters for non-negative expenditures, and outputs distribution metrics.
```bash
python experiments/data_summary.py
```
*Output:* `results_v2/data_summary.txt`

### Step 2: Fixed Model Verification (Table 3 Checkpoint)
Verifies the pre-trained Isolation Forest (`backend/ml/isolation_forest.pkl`) and StandardScaler across Stage 1, Stage 2, and Stage 3 for both `admin10` (10% admin expense limit) and `admin6` (statutory MoRD 6% limit).
```bash
python experiments/table3_fixed_label.py
```
*Outputs:* `results_v2/table3_admin10.csv`, `results_v2/table3_admin6.csv`  
*Verification Checkpoint:* Under `admin10` Stage 3, TP must equal 89,037; FP must equal 7,826; FN must equal 21,069; TN must equal 260,608.

### Step 3: Multi-Seed Retraining & Temporal Ablation
Trains new Isolation Forest models across 5 random seeds (42, 43, 44, 45, 46) on Train FYs (2018-2024), tunes decision threshold $\tau$ on Validation FY (2024-2025), and evaluates on Test FY (2025-2026).

**For 10% Administrative Expense Baseline:**
```bash
python experiments/run_v2_experiments.py --admin admin10
```
*Outputs:* 
- `results_v2/admin10/ablation_test.csv`
- `results_v2/admin10/hyperparameters.json`
- `results_v2/admin10/stress_test.csv`

**For 6% Statutory Administrative Expense Limit:**
```bash
python experiments/run_v2_experiments.py --admin admin6
```
*Outputs:* 
- `results_v2/admin6/ablation_test.csv`
- `results_v2/admin6/hyperparameters.json`
- `results_v2/admin6/stress_test.csv`

### Step 4: Corrected Spatial Aggregation Case Study (Karnataka)
Analyzes Karnataka districts using annual snapshot ratio-of-sums (taking the maximum cumulative Persondays record per district-year) and generates greyscale-readable figures.
```bash
python experiments/karnataka_case_study.py --admin admin10
python experiments/karnataka_case_study.py --admin admin6
```
*Outputs:*
- `results_v2/admin10/karnataka_corrected_table.csv`
- `results_v2/admin6/karnataka_corrected_table.csv`
- `figures_v2/scatter_x1_vs_x4.png`
- `figures_v2/correlation_heatmap.png`
- `figures_v2/ablation_f1_barchart.png`

---

## 3. One-Click Execution

To run all experiments sequentially, execute:
```bash
bash run_all.sh
```
or in PowerShell:
```powershell
python experiments/data_summary.py
python experiments/table3_fixed_label.py
python experiments/run_v2_experiments.py --admin admin10
python experiments/run_v2_experiments.py --admin admin6
python experiments/karnataka_case_study.py --admin admin10
python experiments/karnataka_case_study.py --admin admin6
```

