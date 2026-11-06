from pathlib import Path
import pandas as pd
import numpy as np
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent
csv_path = PROJECT_ROOT / 'backend' / 'data' / 'mgnrega.csv'
model_path = PROJECT_ROOT / 'backend' / 'ml' / 'isolation_forest.pkl'
scaler_path = PROJECT_ROOT / 'backend' / 'ml' / 'scaler.pkl'

print("Reading CSV...")
df = pd.read_csv(csv_path, nrows=1000)
print("Columns:", df.columns.tolist())
print("States sample:", df['state_name'].dropna().unique()[:10])

# Let's inspect full dataset state list and record count
df_full = pd.read_csv(csv_path, usecols=['state_name', 'district_name', 'fin_year', 'month'])
print("Total rows:", len(df_full))
print("Unique states:", df_full['state_name'].nunique())
print("States list:", sorted(df_full['state_name'].dropna().unique().tolist()))
print("Years:", df_full['fin_year'].dropna().unique().tolist())
print("Months:", df_full['month'].dropna().unique().tolist())
