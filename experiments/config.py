"""
GovGuard AI: Central Configuration
All thresholds in one place. Import from here — never hard-code in multiple files.

Admin conf/breach ratios follow the same proportions as admin10:
  conf   = 0.9  × label   (tighter than label to filter borderline cases)
  breach = 1.4  × label   (severe enough to bypass ML gate)
"""

MATERIAL_LABEL, MATERIAL_CONF, MATERIAL_BREACH = 0.40, 0.38, 0.55
COST_LABEL, COST_CONF, COST_BREACH = 450.0, 420.0, 500.0

ADMIN_SETTINGS = {
    "admin10": {"label": 0.10, "conf": 0.09, "breach": 0.14},   # original paper proxy
    "admin6":  {"label": 0.06, "conf": 0.054, "breach": 0.084}, # official MoRD 6% limit
}

SEEDS = [42, 43, 44, 45, 46]
TRAIN_FY = ["2018-2019", "2019-2020", "2020-2021", "2021-2022", "2022-2023", "2023-2024"]
VAL_FY   = ["2024-2025"]
TEST_FY  = ["2025-2026"]

