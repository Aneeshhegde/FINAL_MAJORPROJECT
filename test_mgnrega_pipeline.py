import pandas as pd
import numpy as np
import joblib

csv_path = r'C:\Users\anees\Downloads\All_India_Labour_Allowence_DataSet.csv'
model_path = r'C:\Users\anees\Downloads\MAJOR PROJECT\mgnrega-hybrid\backend\models\isolation_forest.pkl'
scaler_path = r'C:\Users\anees\Downloads\MAJOR PROJECT\mgnrega-hybrid\backend\models\scaler.pkl'

model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

print("Loading Karnataka data...")
df = pd.read_csv(csv_path)
df_kar = df[df['state_name'].str.upper() == 'KARNATAKA'].copy()
print(f"Karnataka rows: {len(df_kar)}")
print("Districts in Karnataka:", sorted(df_kar['district_name'].dropna().unique()))

# Let's inspect Mysuru
df_mys = df_kar[df_kar['district_name'].str.upper() == 'MYSURU'].copy()
print(f"Mysuru rows: {len(df_mys)}")
print("Mysuru sample:")
print(df_mys[['fin_year', 'month', 'Total_Exp', 'Wages', 'Material_and_skilled_Wages', 'Total_Adm_Expenditure', 'Persondays_of_Central_Liability_so_far']].head(5))

# Let's compute record-level features and district aggregate features
total_exp = pd.to_numeric(df_mys['Total_Exp'], errors='coerce').fillna(0).values
mat_exp = pd.to_numeric(df_mys['Material_and_skilled_Wages'], errors='coerce').fillna(0).values
adm_exp = pd.to_numeric(df_mys['Total_Adm_Expenditure'], errors='coerce').fillna(0).values
wage_exp = pd.to_numeric(df_mys['Wages'], errors='coerce').fillna(0).values
persondays = pd.to_numeric(df_mys['Persondays_of_Central_Liability_so_far'], errors='coerce').fillna(0).values

mat_ratio = np.where(total_exp > 0, mat_exp / total_exp, 0)
adm_ratio = np.where(total_exp > 0, adm_exp / total_exp, 0)
wage_ratio = np.where(total_exp > 0, wage_exp / total_exp, 0)
cost_per_day = np.where(persondays > 0, total_exp / persondays, 0)

X_records = np.column_stack([mat_ratio, adm_ratio, wage_ratio, cost_per_day])
X_scaled = scaler.transform(X_records)
preds = model.predict(X_scaled)
scores = model.decision_function(X_scaled)

anomalies = (preds == -1).sum()
print(f"Record-level: Total={len(df_mys)}, Anomalies={anomalies} ({anomalies/len(df_mys)*100:.2f}%)")
print(f"Score min={scores.min():.4f}, max={scores.max():.4f}, mean={scores.mean():.4f}")
