"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "Solar Loan AI Backend"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",  # Vite alternative port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ]
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/solar_loan_ai"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600
    
    # JWT
    SECRET_KEY_JWT: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 25
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AWS S3 / MinIO
    AWS_ACCESS_KEY_ID: str = "minioadmin"
    AWS_SECRET_ACCESS_KEY: str = "minioadmin"
    S3_BUCKET_NAME: str = "solar-loan-documents"
    S3_ENDPOINT_URL: Optional[str] = "http://localhost:9000"
    S3_REGION: str = "us-east-1"
    USE_MINIO: bool = True
    
    # Encryption
    FERNET_KEY: str = "your-fernet-key-change-in-production-32-bytes-long"
    
    # Decentro
    DECENTRO_API_BASE: str = "https://in.staging.decentro.tech"
    DECENTRO_CLIENT_ID: str = "chainfly_staging"
    DECENTRO_CLIENT_SECRET: str = "MR3lyetIcCg8CPNNqsXCF8TDrO0419Bc"
    # Module Secrets
    DECENTRO_KYC_MODULE_SECRET: str = "106I4zQ2xgm2UvA9OOowQLTWciq8Exos"
    DECENTRO_CORE_BANKING_MODULE_SECRET: str = "KkT2muRGLBMgHskJ4GSn4noMiD3TKZoO"
    DECENTRO_BYTES_MODULE_SECRET: str = "SaLmfp0k3lt2ZlKi1Sc0lmk5mupcK"
    DECENTRO_IDFC_BANK_PROVIDER_SECRET: str = "yQVk6hcVfZS4SBo8OJXE0q6LUQFbCEmT"
    DECENTRO_PAYMENTS_MODULE_SECRET: str = "Np8v22u83oIObyDu4mqfZpuJlOpkwvJV"
    DECENTRO_FINANCIAL_SERVICES_MODULE_SECRET: str = "5YgfJC3nzibzinqQpwrSVa46CFA1r2ne"
    DECENTRO_EQUIFAX_PROVIDER_SECRET: str = "NjXoyvuzGF4rW6NEWktLqMJNcHNpiUB1"
    # Legacy/Default (uses KYC module secret)
    DECENTRO_API_KEY: str = "106I4zQ2xgm2UvA9OOowQLTWciq8Exos"
    DECENTRO_WEBHOOK_SECRET: str = ""
    
    # CIBIL
    CIBIL_API_KEY: str = ""
    CIBIL_API_BASE: str = "https://api.cibil.com"
    
    # Mocks
    USE_MOCKS: bool = False
    
    # Email (for password reset, etc.)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@solar-loan-ai.com"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_LOGIN_PER_MINUTE: int = 5
    RATE_LIMIT_KYC_PER_MINUTE: int = 10
    RATE_LIMIT_CIBIL_PER_MINUTE: int = 5
    
    # ML Models
    ML_MODELS_DIR: str = "app/ml_models"
    
    # Data files
    DATA_DIR: str = "app/data"
    
    # PDF Cache
    PDF_CACHE_TTL_DAYS: int = 7
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

