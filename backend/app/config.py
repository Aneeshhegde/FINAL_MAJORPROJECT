import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend root if present
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "Government Scheme Fraud & Anomaly Detection Platform"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    
    # Paths
    BASE_DIR: Path = BACKEND_DIR
    DATA_PATH: Path = BACKEND_DIR / "data" / "mgnrega.csv"
    MODEL_PATH: Path = BACKEND_DIR / "ml" / "isolation_forest.pkl"
    SCALER_PATH: Path = BACKEND_DIR / "ml" / "scaler.pkl"
    
    # API Key for data.gov.in
    DATA_GOV_IN_API_KEY: str = os.getenv("DATA_GOV_IN_API_KEY", "")
    
    # Rules Thresholds for MGNREGA
    MATERIAL_RATIO_THRESHOLD: float = 0.40  # Statutory 60:40 wage:material norm
    ADMIN_RATIO_THRESHOLD: float = 0.10     # Max 10% administrative cost
    WAGE_RATIO_MIN_THRESHOLD: float = 0.60  # Minimum expected wage component
    COST_PER_DAY_THRESHOLD: float = 450.0   # Upper bound cost per personday (INR)

settings = Settings()
