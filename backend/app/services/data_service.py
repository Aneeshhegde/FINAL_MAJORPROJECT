import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from ..config import settings
import logging

logger = logging.getLogger("mgnrega.data_service")

class DataService:
    """
    Manages loading, indexing, caching, and querying of MGNREGA dataset.
    """
    _instance = None
    _df: Optional[pd.DataFrame] = None
    _state_districts: Dict[str, List[str]] = {}
    _states: List[str] = []

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataService, cls).__new__(cls)
            cls._instance._load_dataset()
        return cls._instance

    def _load_dataset(self):
        try:
            logger.info(f"Loading dataset from {settings.DATA_PATH}...")
            # Load with optimized types
            dtype_spec = {
                'fin_year': 'category',
                'month': 'category',
                'state_name': 'str',
                'district_name': 'str',
                'state_code': 'str',
                'district_code': 'str'
            }
            df = pd.read_csv(settings.DATA_PATH, dtype=dtype_spec, low_memory=False)
            
            # Clean string columns
            df['state_name'] = df['state_name'].astype(str).str.strip().str.upper()
            df['district_name'] = df['district_name'].astype(str).str.strip().str.upper()
            
            # Remove NA or invalid states
            df = df[df['state_name'].notna() & (df['state_name'] != 'NAN') & (df['state_name'] != '')]
            df = df[df['district_name'].notna() & (df['district_name'] != 'NAN') & (df['district_name'] != '')]

            # Numerical conversions for core analytical columns
            num_cols = [
                'Total_Exp', 'Wages', 'Material_and_skilled_Wages', 
                'Total_Adm_Expenditure', 'Persondays_of_Central_Liability_so_far',
                'Total_Individuals_Worked', 'Total_Households_Worked',
                'Total_No_of_Active_Job_Cards', 'Total_No_of_Active_Workers',
                'Total_No_of_Workers', 'Total_No_of_Works_Takenup',
                'Number_of_Completed_Works', 'Number_of_Ongoing_Works',
                'Average_Wage_rate_per_day_per_person', 'Women_Persondays',
                'Approved_Labour_Budget'
            ]
            for col in num_cols:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype('float64')
                else:
                    df[col] = 0.0

            self._df = df

            # Cache unique states and state->districts mapping
            self._states = sorted([s for s in df['state_name'].unique() if s])
            
            state_dist_map = {}
            for state in self._states:
                districts = sorted([d for d in df[df['state_name'] == state]['district_name'].unique() if d])
                state_dist_map[state] = districts
            self._state_districts = state_dist_map

            logger.info(f"Loaded {len(df)} records across {len(self._states)} states.")
        except Exception as e:
            logger.error(f"Failed to load dataset: {e}", exc_info=True)
            self._df = pd.DataFrame()

    def get_states(self) -> List[str]:
        return self._states

    def get_districts(self, state: str) -> List[str]:
        state_upper = state.strip().upper()
        return self._state_districts.get(state_upper, [])

    def get_district_records(self, state: str, district: str) -> pd.DataFrame:
        if self._df is None or len(self._df) == 0:
            return pd.DataFrame()
        state_upper = state.strip().upper()
        district_upper = district.strip().upper()

        mask = (self._df['state_name'] == state_upper) & (self._df['district_name'] == district_upper)
        return self._df[mask].copy()

    def get_state_records(self, state: str) -> pd.DataFrame:
        if self._df is None or len(self._df) == 0:
            return pd.DataFrame()
        state_upper = state.strip().upper()
        mask = (self._df['state_name'] == state_upper)
        return self._df[mask].copy()

    def get_national_averages(self) -> Dict[str, float]:
        if self._df is None or len(self._df) == 0:
            return {}
        total_exp = self._df['Total_Exp'].sum()
        persondays = self._df['Persondays_of_Central_Liability_so_far'].sum()
        mat_exp = self._df['Material_and_skilled_Wages'].sum()
        wage_exp = self._df['Wages'].sum()
        adm_exp = self._df['Total_Adm_Expenditure'].sum()

        return {
            'avg_cost_per_day': float(total_exp / persondays) if persondays > 0 else 0.0,
            'avg_material_ratio': float(mat_exp / total_exp) if total_exp > 0 else 0.0,
            'avg_wage_ratio': float(wage_exp / total_exp) if total_exp > 0 else 0.0,
            'avg_admin_ratio': float(adm_exp / total_exp) if total_exp > 0 else 0.0
        }

    def append_live_records(self, new_df: pd.DataFrame):
        """Appends verified live records into in-memory data store."""
        if self._df is not None and not new_df.empty:
            self._df = pd.concat([self._df, new_df], ignore_index=True)
            logger.info(f"Appended {len(new_df)} live records to in-memory store.")

data_service = DataService()
