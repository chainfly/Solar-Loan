# Solar Loan AI Backend

FastAPI backend for Solar Loan AI application with comprehensive features including authentication, loan management, KYC/CIBIL integration, AI/ML predictions, and more.

## Features

- **Authentication**: JWT-based auth with refresh tokens, password reset
- **Loan Management**: CRUD operations with automated workflow (KYC → CIBIL → AI → Subsidy → EMI)
- **Document Management**: Upload to S3/MinIO with OCR support
- **KYC Integration**: Decentro integration for Aadhaar, PAN, Bank, CKYC verification
- **Credit Bureau**: CIBIL integration with consent tracking
- **AI/ML**: Eligibility prediction, ROI calculation, angle optimization, prequalification
- **Calculations**: EMI, subsidy calculations
- **PDF Reports**: Generate and cache loan reports
- **Security**: Encryption, PII masking, rate limiting, webhook validation
- **Audit Logging**: Comprehensive audit trail

## Tech Stack

- **FastAPI**: Modern async web framework
- **PostgreSQL**: Database with SQLAlchemy Async 2.x
- **Alembic**: Database migrations
- **Redis**: Caching and session management
- **MinIO/S3**: Object storage
- **Celery**: Background task processing
- **Pytest**: Testing framework
- **Docker**: Containerization

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run database migrations**
```bash
alembic upgrade head
```

6. **Run the application**
```bash
uvicorn app.main:app --reload
```

### Docker Setup

1. **Start all services**
```bash
docker-compose up -d
```

2. **Run migrations**
```bash
docker-compose exec backend alembic upgrade head
```

3. **Access services**
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
- Redis: localhost:6379
- PostgreSQL: localhost:5432

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py
```

## Project Structure

```
backend/
├── app/
│   ├── core/           # Core configuration (database, redis, s3, security)
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── routers/        # API route handlers
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── ml_models/      # ML model files
│   ├── data/           # Data files (subsidy, irradiation)
│   └── main.py         # FastAPI application
├── alembic/            # Database migrations
├── tests/              # Test files
├── docker-compose.yml  # Docker services
├── Dockerfile          # Backend image
└── requirements.txt    # Python dependencies
```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY_JWT`: JWT secret key
- `FERNET_KEY`: Encryption key (32 bytes)
- `USE_MOCKS`: Enable mock mode for external APIs
- `DECENTRO_*`: Decentro API credentials
- `CIBIL_API_KEY`: CIBIL API key

## License

Proprietary

