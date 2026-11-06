#!/bin/bash
# GovGuard AI — Run all experiments for both admin settings
set -e
cd "$(dirname "$0")"
python experiments/data_summary.py
python experiments/run_v2_experiments.py --admin admin10
python experiments/run_v2_experiments.py --admin admin6
python experiments/table3_fixed_label.py
python experiments/karnataka_case_study.py --admin admin10
python experiments/karnataka_case_study.py --admin admin6
echo "All experiments complete. Results in results_v2/ and figures_v2/"

