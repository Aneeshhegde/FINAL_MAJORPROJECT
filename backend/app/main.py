from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes.analysis import router as analysis_router
from .services.model_service import model_service
from .services.data_service import data_service
import logging

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("mgnrega.app")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production AI Platform for Government Scheme Fraud & Anomaly Detection (MGNREGA + Multi-Scheme)"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Analysis Router
app.include_router(analysis_router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Operational",
        "model_loaded": model_service.is_loaded,
        "records_indexed": len(data_service._df) if data_service._df is not None else 0,
        "states_available": len(data_service.get_states()),
        "endpoints": {
            "schemes": "/api/schemes",
            "states": "/api/states",
            "districts": "/api/districts?state=KARNATAKA",
            "analyze": "POST /api/analyze",
            "district_ranking": "/api/district-ranking?state=KARNATAKA",
            "state_overview": "/api/state-overview?state=KARNATAKA",
            "sync_live": "POST /api/sync/live"
        }
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": model_service.is_loaded,
        "dataset_loaded": data_service._df is not None and len(data_service._df) > 0,
        "total_records": len(data_service._df) if data_service._df is not None else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
