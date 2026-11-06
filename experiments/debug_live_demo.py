import sys
import io
import time
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

print("[1] Importing pandas...")
import pandas as pd
print("[2] Importing upload_service...")
from backend.app.services.upload_service import upload_service

print("[3] Reading CSV...")
csv_path = root_dir / "backend" / "data" / "demo" / "demo_upload_SYNTHETIC_v2.csv"
df_raw = pd.read_csv(csv_path)
print(f"[4] Read CSV with {len(df_raw)} rows.")

print("[5] Validating and cleaning data...")
t0 = time.time()
df_clean, val = upload_service.validate_and_clean_data(df_raw)
print(f"[6] Validated in {time.time()-t0:.2f}s: {val['rows_kept']} kept.")

print("[7] Analyzing dataset...")
t0 = time.time()
res = upload_service.analyze_dataset(df_clean, val)
print(f"[8] Analyzed in {time.time()-t0:.2f}s: records={res['kpis']['records']}, flagged={res['kpis']['flagged_records']}")

print("[9] Comparing answer key...")
key_path = root_dir / "backend" / "data" / "demo" / "demo_answer_key_v2.csv"
df_key = pd.read_csv(key_path)
t0 = time.time()
cmp = upload_service.compare_with_answer_key(df_key, res)
print(f"[10] Compared in {time.time()-t0:.2f}s: TP={cmp['confusion_matrix']['tp']}, FP={cmp['confusion_matrix']['fp']}, FN={cmp['confusion_matrix']['fn']}, TN={cmp['confusion_matrix']['tn']}")
print("ALL DONE SUCCESS!")

