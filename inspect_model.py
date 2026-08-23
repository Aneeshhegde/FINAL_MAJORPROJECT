import joblib
import pandas as pd
import numpy as np
import os

model_path = r'C:\Users\anees\Downloads\MAJOR PROJECT\mgnrega-hybrid\backend\models\isolation_forest.pkl'
scaler_path = r'C:\Users\anees\Downloads\MAJOR PROJECT\mgnrega-hybrid\backend\models\scaler.pkl'

print("Checking model files:")
print("Model exists:", os.path.exists(model_path))
print("Scaler exists:", os.path.exists(scaler_path))

try:
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    print("Model type:", type(model))
    print("Model n_features_in_:", getattr(model, 'n_features_in_', None))
    print("Model contamination:", getattr(model, 'contamination', None))
    print("Model offset_:", getattr(model, 'offset_', None))
    print("Scaler mean_:", getattr(scaler, 'mean_', None))
    print("Scaler scale_:", getattr(scaler, 'scale_', None))
    print("Scaler n_features_in_:", getattr(scaler, 'n_features_in_', None))
    print("Scaler feature_names_in_:", getattr(scaler, 'feature_names_in_', None))
except Exception as e:
    print("Error loading:", e)
