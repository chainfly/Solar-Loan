"""
FastAPI Main Application
Solar Loan AI Backend
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.database import init_db
from app.core.logging_config import setup_logging
from app.core.redis_client import init_redis
from app.core.s3_client import init_s3
from app.core.ml_loader import load_ml_models
from app.routers import (
    auth,
    loans,
    documents,
    kyc,
    credit,
    ai,
    calculations,
    reports,
    webhooks,
    collections,
)
from app.middleware.audit import AuditMiddleware
from app.middleware.security import SecurityMiddleware

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Solar Loan AI Backend...")
    await init_db()
    await init_redis()
    init_s3()  # S3 init is synchronous
    await load_ml_models()
    logger.info("Backend started successfully")
    yield
    # Shutdown
    logger.info("Shutting down backend...")


# Create FastAPI app
app = FastAPI(
    title="Solar Loan AI API",
    description="Backend API for Solar Loan AI Application",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Custom middleware
app.add_middleware(AuditMiddleware)
app.add_middleware(SecurityMiddleware)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "solar-loan-ai-backend"}


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(loans.router, prefix="/api/loans", tags=["Loans"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(kyc.router, prefix="/api/kyc", tags=["KYC"])
app.include_router(credit.router, prefix="/api/credit", tags=["Credit"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI/ML"])
app.include_router(calculations.router, prefix="/api/calculate", tags=["Calculations"])
app.include_router(reports.router, prefix="/api/report", tags=["Reports"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(collections.router, prefix="/api/collections", tags=["Collections"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )

