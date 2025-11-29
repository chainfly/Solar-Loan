"""
ML Models Loader
"""
import joblib
import os
from pathlib import Path
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Global model storage
ml_models = {}


async def load_ml_models():
    """Load ML models at startup"""
    models_dir = Path(settings.ML_MODELS_DIR)
    
    if not models_dir.exists():
        logger.warning(f"ML models directory not found: {models_dir}")
        return
    
    model_files = {
        "eligibility": "eligibility_model.pkl",
        "roi_prediction": "roi_model.pkl",
        "angle_optimization": "angle_model.pkl",
        "prequal": "prequal_model.pkl",
    }
    
    for model_name, filename in model_files.items():
        model_path = models_dir / filename
        if model_path.exists():
            try:
                ml_models[model_name] = joblib.load(model_path)
                logger.info(f"Loaded {model_name} model from {model_path}")
            except Exception as e:
                logger.error(f"Failed to load {model_name} model: {e}")
        else:
            logger.warning(f"Model file not found: {model_path}")
    
    if not ml_models:
        logger.warning("No ML models loaded. Using mock predictions.")


def get_model(model_name: str):
    """Get a loaded ML model"""
    return ml_models.get(model_name)

