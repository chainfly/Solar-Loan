"""
Logging Configuration
"""
import logging
import sys
from logging.handlers import RotatingFileHandler
from app.core.config import settings
import os

def setup_logging():
    """Setup application logging"""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    # Create logs directory
    os.makedirs("logs", exist_ok=True)
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            RotatingFileHandler(
                "logs/app.log",
                maxBytes=10 * 1024 * 1024,  # 10MB
                backupCount=5,
            ),
            logging.StreamHandler(sys.stdout),
        ],
    )
    
    # Set specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.DEBUG if settings.DEBUG else logging.WARNING
    )

