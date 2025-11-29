# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Docker Desktop installed and running
- ✅ Python 3.11+ installed
- ✅ pip installed

## Step 1: Start Docker Desktop

**On macOS:**
```bash
# Open Docker Desktop application
open -a Docker
```

**On Linux:**
```bash
sudo systemctl start docker
```

**Verify Docker is running:**
```bash
docker ps
```

If you see an error, Docker is not running. Start Docker Desktop first.

## Step 2: Install Python Dependencies

```bash
cd backend

# Create virtual environment (recommended)
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Step 3: Start Services with Docker Compose

```bash
cd backend
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (ports 9000, 9001)
- Backend API (port 8000)

**Check if services are running:**
```bash
docker-compose ps
```

## Step 4: Run Database Migrations

```bash
cd backend

# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run migrations
alembic upgrade head
```

If you get "command not found: alembic", make sure:
1. Virtual environment is activated
2. Dependencies are installed: `pip install -r requirements.txt`

## Step 5: Verify Backend is Running

```bash
# Check backend logs
docker-compose logs backend

# Or test the health endpoint
curl http://localhost:8000/health
```

**Access API Documentation:**
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Step 6: Start Frontend

```bash
# From project root
npm install
npm run dev
```

Frontend will run on: http://localhost:5173

## Troubleshooting

### Docker Not Running
```
Error: Cannot connect to the Docker daemon
```
**Solution:** Start Docker Desktop application

### Alembic Command Not Found
```
zsh: command not found: alembic
```
**Solution:**
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Now alembic should work
alembic upgrade head
```

### Port Already in Use
```
Error: port 8000 already in use
```
**Solution:**
```bash
# Find and kill process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in docker-compose.yml
```

### Database Connection Error
```
Error: connection refused
```
**Solution:**
```bash
# Check if PostgreSQL container is running
docker-compose ps

# Restart services
docker-compose restart postgres
```

### Migration Errors
```
Error: relation "users" already exists
```
**Solution:**
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
alembic upgrade head
```

## Alternative: Run Backend Locally (Without Docker)

If you prefer not to use Docker:

### 1. Install PostgreSQL and Redis Locally

**macOS:**
```bash
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis
```

**Linux:**
```bash
sudo apt-get install postgresql-15 redis-server
sudo systemctl start postgresql
sudo systemctl start redis
```

### 2. Create Database
```bash
createdb solar_loan_ai
# Or using psql:
psql -c "CREATE DATABASE solar_loan_ai;"
```

### 3. Update .env File
```bash
cd backend
cp env.example .env
# Edit .env with local database URL:
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/solar_loan_ai
```

### 4. Run Migrations
```bash
source venv/bin/activate
alembic upgrade head
```

### 5. Start Backend
```bash
uvicorn app.main:app --reload
```

## Verify Everything Works

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy","service":"solar-loan-ai-backend"}`

2. **API Docs:**
   - Visit: http://localhost:8000/api/docs
   - Should show Swagger UI

3. **Test Registration:**
   ```bash
   curl -X POST "http://localhost:8000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123!@#","full_name":"Test User"}'
   ```

## Next Steps

Once backend is running:
1. ✅ Backend is ready
2. ⏳ Integrate frontend (see `FRONTEND_BACKEND_SYNC.md`)
3. ⏳ Test end-to-end flow

