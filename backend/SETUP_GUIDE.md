# Setup Guide

## Quick Start

### Option 1: Docker (Recommended)

1. **Start all services**
```bash
cd backend
docker-compose up -d
```

2. **Run migrations**
```bash
docker-compose exec backend alembic upgrade head
```

3. **Access the API**
- API: http://localhost:8000
- Docs: http://localhost:8000/api/docs
- MinIO: http://localhost:9001 (minioadmin/minioadmin)

### Option 2: Local Development

1. **Install dependencies**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Start PostgreSQL and Redis**
```bash
# Using Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine
docker run -d -p 6379:6379 redis:7-alpine

# Or use local installations
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Run migrations**
```bash
alembic upgrade head
```

5. **Start the server**
```bash
uvicorn app.main:app --reload
```

## Database Setup

### Create Database
```sql
CREATE DATABASE solar_loan_ai;
```

### Run Migrations
```bash
alembic upgrade head
```

### Create New Migration
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test
pytest tests/test_auth.py -v
```

## Development Workflow

1. **Create feature branch**
```bash
git checkout -b feat/your-feature
```

2. **Make changes and test**
```bash
pytest
ruff check app/
```

3. **Run migrations if needed**
```bash
alembic revision --autogenerate -m "add new field"
alembic upgrade head
```

4. **Commit and push**
```bash
git add .
git commit -m "feat: your feature"
git push origin feat/your-feature
```

## Common Issues

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check database exists

### Redis Connection Error
- Check Redis is running
- Verify REDIS_URL in .env

### Migration Errors
- Ensure database is clean or backup existing data
- Check migration files for syntax errors
- Run `alembic downgrade -1` then `alembic upgrade head`

### Import Errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`
- Check PYTHONPATH

## Production Deployment

1. **Set environment variables**
```bash
export DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
export SECRET_KEY_JWT=strong-secret-key
export FERNET_KEY=32-byte-fernet-key
export USE_MOCKS=false
```

2. **Run migrations**
```bash
alembic upgrade head
```

3. **Start with gunicorn**
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Next Steps

- Review API documentation at `/api/docs`
- Check `docs/backend_contracts.md` for API contracts
- Review `docs/decentro_integration.md` for Decentro setup
- Run QA checklist from `docs/QA_CHECKLIST.md`

