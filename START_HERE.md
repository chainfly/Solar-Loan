# 🚀 START HERE - Quick Setup

## The "Load failed" Error Fix

**Problem:** You're seeing "Registration Failed - Load failed" because the backend isn't running.

## Quick Solution (3 Steps)

### 1️⃣ Start Backend

```bash
cd backend
docker-compose up -d
```

**Wait 10 seconds for services to start**, then verify:
```bash
curl http://localhost:8000/health
```

Should return: `{"status":"healthy"}`

### 2️⃣ Run Database Migrations

```bash
cd backend
source venv/bin/activate 
alembic upgrade head
```

### 3️⃣ Start Frontend

```bash
# From project root
f
```

## That's It! ✅

Now try registering again. The error should be fixed.

---

## If Backend Still Won't Start

### Check Docker
```bash
docker ps
# Should show: postgres, redis, minio, backend
```

### Check Logs
```bash
cd backend
docker-compose logs backend
```

### Manual Start (if Docker fails)
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Verify Everything Works

1. **Backend Health:** http://localhost:8000/health
2. **API Docs:** http://localhost:8000/api/docs
3. **Frontend:** http://localhost:5173
4. **Try Registration:** Should work now!

---

## Need More Help?

- See `QUICK_FIX.md` for detailed troubleshooting
- See `backend/QUICK_START.md` for full setup guide
- See `backend/TROUBLESHOOTING.md` for common errors

