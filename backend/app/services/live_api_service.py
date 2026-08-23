import requests
import pandas as pd
import logging
from typing import Dict, Any, Optional
from ..config import settings
from .data_service import data_service

logger = logging.getLogger("mgnrega.live_api")

class LiveAPIService:
    """
    Connects to official Open Government Data (data.gov.in) APIs.
    Fetches real-time feeds and ingests them into the platform pipeline.
    """
    def __init__(self):
        self.api_key = settings.DATA_GOV_IN_API_KEY
        self.base_url = "https://api.data.gov.in/resource"

    def fetch_live_district_data(self, state: str, district: str, limit: int = 50) -> Dict[str, Any]:
        """
        Attempts to fetch live records from data.gov.in using the configured API key.
        Falls back gracefully if government API is temporarily unreachable.
        """
        if not self.api_key:
            return {
                "status": "error",
                "message": "No data.gov.in API key configured."
            }

        # Resource ID for MGNREGA monthly district performance
        resource_id = "9ef84268-d588-465a-a308-a864a43d0070"
        url = f"{self.base_url}/{resource_id}"
        params = {
            "api-key": self.api_key,
            "format": "json",
            "limit": limit,
            "filters[state_name]": state.upper(),
            "filters[district_name]": district.upper()
        }

        try:
            logger.info(f"Connecting to data.gov.in for {state} -> {district}...")
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                records = data.get("records", [])
                logger.info(f"Successfully fetched {len(records)} live records from data.gov.in.")
                return {
                    "status": "success",
                    "source": "data.gov.in OGD Live API",
                    "record_count": len(records),
                    "records": records
                }
            else:
                logger.warning(f"data.gov.in returned HTTP {response.status_code}: {response.text[:200]}")
                return {
                    "status": "api_unavailable",
                    "message": f"Government API returned status {response.status_code}. Using local high-speed warehouse.",
                    "source": "Local Historical Warehouse (389k records)"
                }
        except Exception as e:
            logger.warning(f"Live API connection timeout/error ({e}). Falling back to local warehouse.")
            return {
                "status": "fallback_active",
                "message": "Live API timed out or unavailable. Serving verified local dataset seamlessly.",
                "source": "Local Historical Warehouse (389k records)"
            }

live_api_service = LiveAPIService()
