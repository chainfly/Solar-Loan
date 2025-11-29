# Troubleshooting Guide

## Common Errors and Solutions

### 1. Docker Daemon Not Running

**Error:**
```
Cannot connect to the Docker daemon at unix:///Users/pranay/.docker/run/docker.sock
Is the docker daemon running?
```

**Solution:**
1. **macOS:** Open Docker Desktop application
   ```bash
   open -a Docker
   ```
2. **Linux:** Start Docker service
   ```bash
   sudo systemctl start docker
   ```
3. **Verify:** 
   ```bash
   docker ps
   ```
   Should not show an error.

---

### 2. Alembic Command Not Found

**Error:**
```
zsh: command not found: alembic
```

**Solution:**
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Now alembic should work
alembic upgrade head
```

**Note:** Always activate virtual environment before running alembic or uvicorn.

---

### 3. Port Already in Use

**Error:**
```
Error: port 8000 already in use
```

**Solution:**

**Option 1: Kill the process**
```bash
# Find process using port 8000
lsof -ti:8000 | xargs kill -9

# Or on Linux:
sudo fuser -k 8000/tcp
```

**Option 2: Change port in docker-compose.yml**
```yaml
backend:
  ports:
    - "8001:8000"  # Change 8000 to 8001
```

---

### 4. Database Connection Error

**Error:**
```
asyncpg.exceptions.InvalidPasswordError
connection refused
```

**Solution:**

1. **Check if PostgreSQL is running:**
   ```bash
   docker-compose ps
   ```

2. **Check PostgreSQL logs:**
   ```bash
   docker-compose logs postgres
   ```

3. **Restart PostgreSQL:**
   ```bash
   docker-compose restart postgres
   ```

4. **Verify connection string in .env:**
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/solar_loan_ai
   ```

---

### 5. Migration Errors

**Error:**
```
relation "users" already exists
```

**Solution:**

**Option 1: Reset database (deletes all data)**
```bash
docker-compose down -v
docker-compose up -d
alembic upgrade head
```

**Option 2: Rollback and reapply**
```bash
alembic downgrade -1
alembic upgrade head
```

---

### 6. Redis Connection Error

**Error:**
```
redis.exceptions.ConnectionError
```

**Solution:**
```bash
# Check if Redis is running
docker-compose ps redis

# Restart Redis
docker-compose restart redis

# Check Redis logs
docker-compose logs redis
```

---

### 7. Module Import Errors

**Error:**
```
ModuleNotFoundError: No module named 'app'
```

**Solution:**
```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run from backend directory
uvicorn app.main:app --reload
```

---

### 8. Permission Denied Errors

**Error:**
```
Permission denied: '/app/logs'
```

**Solution:**
```bash
# Create logs directory with proper permissions
mkdir -p backend/logs
chmod 755 backend/logs
```

---

### 9. S3/MinIO Connection Error

**Error:**
```
botocore.exceptions.ClientError: Access Denied
```

**Solution:**

1. **Check MinIO is running:**
   ```bash
   docker-compose ps minio
   ```

2. **Access MinIO console:**
   - URL: http://localhost:9001
   - Username: minioadmin
   - Password: minioadmin

3. **Verify credentials in .env:**
   ```env
   AWS_ACCESS_KEY_ID=minioadmin
   AWS_SECRET_ACCESS_KEY=minioadmin
   S3_ENDPOINT_URL=http://localhost:9000
   ```

---

### 10. Python Version Issues

**Error:**
```
Python version 3.10 is not supported
```

**Solution:**
```bash
# Check Python version
python3 --version

# Should be 3.11 or higher
# Install Python 3.11+ if needed

# macOS:
brew install python@3.11

# Linux:
sudo apt-get install python3.11
```

---

## Quick Diagnostic Commands

```bash
# Check Docker status
docker ps
docker-compose ps

# Check service logs
docker-compose logs backend
docker-compose logs postgres
docker-compose logs redis

# Check if ports are in use
lsof -i :8000
lsof -i :5432
lsof -i :6379

# Test database connection
docker-compose exec postgres psql -U postgres -d solar_loan_ai -c "SELECT 1;"

# Test Redis connection
docker-compose exec redis redis-cli ping

# Check Python environment
which python3
python3 --version
pip list | grep fastapi
```

---

## Getting Help

If issues persist:

1. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

2. **Verify environment:**
   ```bash
   cat backend/.env
   ```

3. **Test individual services:**
   ```bash
   # Test backend directly
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

4. **Reset everything:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   cd backend
   source venv/bin/activate
   alembic upgrade head
   ```

---

## Still Having Issues?

1. Ensure all prerequisites are installed
2. Check the `QUICK_START.md` guide
3. Verify Docker Desktop is running
4. Check that ports are not in use
5. Review service logs for specific errors

