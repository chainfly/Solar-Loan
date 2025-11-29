# Quick Fix: "Load failed" Error

## Problem
The error "Load failed" or "Registration Failed" occurs because the **backend server is not running**.

## Solution

### Step 1: Start Backend

**Option A: Using Docker (Recommended)**
```bash
cd backend
docker-compose up -d
```

**Option B: Local Development**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Step 2: Verify Backend is Running

```bash
# Test health endpoint
curl http://localhost:8000/health

# Should return: {"status":"healthy","service":"solar-loan-ai-backend"}
```

Or visit in browser: http://localhost:8000/api/docs

### Step 3: Check Frontend Environment

Create `.env` file in project root (if not exists):
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Step 4: Restart Frontend

```bash
# Stop current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## Common Issues

### Backend Won't Start

1. **Docker not running:**
   ```bash
   # Start Docker Desktop first
   open -a Docker  # macOS
   ```

2. **Port already in use:**
   ```bash
   # Kill process on port 8000
   lsof -ti:8000 | xargs kill -9
   ```

3. **Database not ready:**
   ```bash
   cd backend
   docker-compose up -d postgres redis
   # Wait 10 seconds
   alembic upgrade head
   ```

### CORS Errors

If you see CORS errors, check `backend/app/core/config.py`:
```python
CORS_ORIGINS: List[str] = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # Alternative
]
```

### Still Not Working?

1. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

2. Check if backend is accessible:
   ```bash
   curl http://localhost:8000/health
   ```

3. Check browser console (F12) for detailed errors

4. Verify API URL in frontend:
   - Open browser DevTools → Network tab
   - Try registration again
   - Check the failed request URL

## Expected Flow

1. ✅ Backend running on http://localhost:8000
2. ✅ Frontend running on http://localhost:5173
3. ✅ Registration API call succeeds
4. ✅ User sees verification step

