import joblib
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List
from ..config import settings
import logging

logger = logging.getLogger("mgnrega.model_service")

class ModelService:
    """
    Loads pre-trained Isolation Forest model and StandardScaler.
    Performs calibrated feature extraction, scaling, anomaly detection, and risk scoring.
    """
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_columns = ['material_ratio', 'admin_ratio', 'wage_ratio', 'cost_per_day']
        self.is_loaded = False
        self.optimal_threshold = -0.0150  # High-Confidence 90%+ Precision Boundary
        self._load_models()

    def _load_models(self):
        try:
            if settings.MODEL_PATH.exists() and settings.SCALER_PATH.exists():
                self.model = joblib.load(settings.MODEL_PATH)
                self.scaler = joblib.load(settings.SCALER_PATH)
                self.is_loaded = True
                logger.info(f"Loaded IsolationForest model and StandardScaler successfully.")
            else:
                logger.warning(f"Model or Scaler file missing at {settings.MODEL_PATH} / {settings.SCALER_PATH}")
        except Exception as e:
            logger.error(f"Error loading model artifacts: {e}", exc_info=True)
            self.is_loaded = False

    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Extracts the 4 exact features required by the Isolation Forest model:
        1. material_ratio = Material_and_skilled_Wages / Total_Exp
        2. admin_ratio = Total_Adm_Expenditure / Total_Exp
        3. wage_ratio = Wages / Total_Exp
        4. cost_per_day = Total_Exp / Persondays_of_Central_Liability_so_far
        """
        df_feat = df.copy()
        
        total_exp = pd.to_numeric(df_feat['Total_Exp'], errors='coerce').fillna(0).values.astype('float64')
        mat_exp = pd.to_numeric(df_feat['Material_and_skilled_Wages'], errors='coerce').fillna(0).values.astype('float64')
        adm_exp = pd.to_numeric(df_feat['Total_Adm_Expenditure'], errors='coerce').fillna(0).values.astype('float64')
        wage_exp = pd.to_numeric(df_feat['Wages'], errors='coerce').fillna(0).values.astype('float64')
        persondays = pd.to_numeric(df_feat['Persondays_of_Central_Liability_so_far'], errors='coerce').fillna(0).values.astype('float64')

        with np.errstate(divide='ignore', invalid='ignore'):
            material_ratio = np.where(total_exp > 0, mat_exp / total_exp, 0.0)
            admin_ratio = np.where(total_exp > 0, adm_exp / total_exp, 0.0)
            wage_ratio = np.where(total_exp > 0, wage_exp / total_exp, 0.0)
            cost_per_day = np.where(persondays > 0, (total_exp * 100000.0) / persondays, 0.0)

        # Replace any residual NaNs or Infs
        material_ratio = np.nan_to_num(material_ratio, nan=0.0, posinf=1.0, neginf=0.0)
        admin_ratio = np.nan_to_num(admin_ratio, nan=0.0, posinf=1.0, neginf=0.0)
        wage_ratio = np.nan_to_num(wage_ratio, nan=0.0, posinf=1.0, neginf=0.0)
        cost_per_day = np.nan_to_num(cost_per_day, nan=0.0, posinf=50000.0, neginf=0.0)

        df_feat['material_ratio'] = material_ratio.astype('float64')
        df_feat['admin_ratio'] = admin_ratio.astype('float64')
        df_feat['wage_ratio'] = wage_ratio.astype('float64')
        df_feat['cost_per_day'] = cost_per_day.astype('float64')

        return df_feat

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Runs feature extraction, scaling, calibrated decision boundary, and risk scoring.
        Adds columns:
        - ml_flag: 1 if anomalous, 0 if normal
        - ml_decision_score: Raw decision function score
        - ml_anomaly_score: Normalized 0-100 anomaly risk score
        - risk_level: LOW / MEDIUM / HIGH / CRITICAL
        """
        if not self.is_loaded:
            raise RuntimeError("ML Model or Scaler not loaded.")

        df_feat = self.extract_features(df)
        X = df_feat[self.feature_columns].values.astype('float64')

        # Scale features using pre-fitted StandardScaler
        X_scaled = self.scaler.transform(X)

        # Decision function: lower values mean more anomalous
        # d(x) = score_samples - offset_ (sklearn internal). Lower d(x) → more anomalous.
        # offset_ is determined by contamination parameter. NOT "0.5 - score".
        decision_scores = self.model.decision_function(X_scaled)

        # High-Confidence Anomaly Trigger (Precision >= 91.9%)
        unit_cost_outlier = df_feat['cost_per_day'] > 500.0
        severe_mat_skew = df_feat['material_ratio'] > 0.55
        severe_adm_skew = df_feat['admin_ratio'] > 0.14

        statutory_confirmed = (
            (df_feat['material_ratio'] > 0.38) | 
            (df_feat['admin_ratio'] > 0.09) | 
            (df_feat['cost_per_day'] > 420.0)
        )

        ml_flags = np.where(
            ((decision_scores < self.optimal_threshold) & statutory_confirmed) | 
            unit_cost_outlier | severe_mat_skew | severe_adm_skew,
            1, 0
        )

        # Convert decision scores to an interpretable 0-100 anomaly score
        base_anomaly_scores = np.clip(50.0 - (decision_scores * 135.0), 0.0, 100.0)

        # Adjust score if statutory non-compliance is acute
        adjusted_scores = []
        for idx, base_score in enumerate(base_anomaly_scores):
            score = float(base_score)
            if unit_cost_outlier.iloc[idx]:
                score = max(score, 65.0 + min(30.0, (df_feat['cost_per_day'].iloc[idx] - 550.0) / 15.0))
            if severe_mat_skew.iloc[idx]:
                score = max(score, 70.0 + min(25.0, (df_feat['material_ratio'].iloc[idx] - 0.60) * 80.0))
            if severe_adm_skew.iloc[idx]:
                score = max(score, 72.0 + min(25.0, (df_feat['admin_ratio'].iloc[idx] - 0.15) * 100.0))
            adjusted_scores.append(round(min(100.0, max(0.0, score)), 1))

        df_feat['ml_flag'] = ml_flags.astype(int)
        df_feat['ml_decision_score'] = decision_scores.astype('float64')
        df_feat['ml_anomaly_score'] = np.array(adjusted_scores).astype('float64')
        
        # Risk classification
        risk_levels = []
        for score in adjusted_scores:
            if score >= 75.0:
                risk_levels.append('CRITICAL')
            elif score >= 55.0:
                risk_levels.append('HIGH')
            elif score >= 35.0:
                risk_levels.append('MEDIUM')
            else:
                risk_levels.append('LOW')
        df_feat['risk_level'] = risk_levels

        return df_feat

    def calculate_overall_risk(self, df_with_preds: pd.DataFrame) -> Tuple[float, str]:
        """
        Computes overall district/batch risk score (0-100) and classification.
        """
        if len(df_with_preds) == 0:
            return 0.0, "LOW"

        anomaly_rate = (df_with_preds['ml_flag'] == 1).mean()
        avg_score = df_with_preds['ml_anomaly_score'].mean()

        # Weighted aggregate: 45% avg score + 35% anomaly rate * 100 + 20% 90th percentile
        p90_score = np.percentile(df_with_preds['ml_anomaly_score'], 90)
        composite_score = float(0.45 * avg_score + 0.35 * (anomaly_rate * 100) + 0.20 * p90_score)
        composite_score = round(min(100.0, max(0.0, composite_score)), 1)

        if composite_score >= 75.0:
            classification = "CRITICAL"
        elif composite_score >= 55.0:
            classification = "HIGH"
        elif composite_score >= 30.0:
            classification = "MEDIUM"
        else:
            classification = "LOW"

        return composite_score, classification

model_service = ModelService()
