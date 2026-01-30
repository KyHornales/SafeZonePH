# Vercel Deployment Guide for SafeZonePH

## 📋 Overview

This guide will help you deploy SafeZonePH to Vercel with both the React frontend and Python FastAPI backend.

## 🏗️ Project Structure

```
SafeZonePH-3.0-backend-integration/
├── api/                    # Python serverless functions
│   └── index.py           # Main FastAPI app (Vercel serverless)
├── src/                    # React frontend
├── public/                 # Static assets
├── package.json           # Frontend dependencies
├── requirements.txt       # Python dependencies
└── vercel.json           # Vercel configuration
```

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm install -g vercel
   ```

2. **Create `.env.local`** for local development:
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local`**:
   ```env
   # For local development
   REACT_APP_API_URL=http://localhost:8000
   DATABASE_URL=sqlite:///./safezoneph_dev.db
   JWT_SECRET_KEY=your-local-secret-key
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Vercel will auto-detect the configuration from `vercel.json`
5. Configure environment variables (see Step 3)
6. Click "Deploy"

#### Option B: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 3: Environment Variables on Vercel

Go to your project in Vercel Dashboard → Settings → Environment Variables

Add these **backend environment variables**:

```
JWT_SECRET_KEY=<generate-strong-random-key>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
DATABASE_URL=<your-production-database-url>
```

**Important Notes:**
- **JWT_SECRET_KEY**: Generate a strong random key (at least 32 characters)
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- **DATABASE_URL**: 
  - For SQLite (testing only): `sqlite:///./safezoneph_prod.db`
  - For PostgreSQL (recommended): `postgresql://user:password@host:port/database`
  - Consider using **Vercel Postgres** or **Supabase** for production

### Step 4: Database Setup for Production

#### Option A: Vercel Postgres (Recommended)

1. In Vercel Dashboard → Storage → Create Database → Postgres
2. Copy the `DATABASE_URL` connection string
3. Add it to Environment Variables
4. The database tables will be created automatically on first API call

#### Option B: Supabase (Free PostgreSQL)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
5. Add to Vercel environment variables

#### Option C: SQLite (NOT recommended for production)

- SQLite works but files reset on each deployment
- Only use for testing/demo purposes

### Step 5: Seed Initial Data

After deployment, seed community tasks:

```bash
curl -X POST https://your-app.vercel.app/api/seed-community-tasks
```

Or visit:
```
https://your-app.vercel.app/api/seed-community-tasks
```

## 🔧 How It Works

### Local Development

**Frontend** (`npm start`):
- Runs on http://localhost:3000
- API calls go to `http://localhost:8000` (local Python server)
- Uses REACT_APP_API_URL from `.env.local`

**Backend** (`python backend/app/main.py`):
- Runs on http://localhost:8000
- Traditional FastAPI server with Uvicorn

### Production on Vercel

**Frontend**:
- Deployed as static React build
- Served from Vercel CDN

**Backend**:
- Python code in `/api` becomes serverless functions
- Each API call triggers a function execution
- No persistent server running (serverless!)

**Routing**:
- `/` → React app (index.html)
- `/api/*` → Python serverless functions (api/index.py)

## 📝 API URL Configuration Explained

The frontend API service automatically detects the environment:

```typescript
const getApiBaseUrl = (): string => {
  // 1. If REACT_APP_API_URL is set, use it (manual override)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 2. In production (Vercel), use relative URLs
  if (process.env.NODE_ENV === 'production') {
    return '';  // Calls will be /api/... (same domain)
  }
  
  // 3. In development, use local backend
  return 'http://127.0.0.1:8000';
};
```

**Result:**
- **Local dev**: `http://localhost:8000/api/auth/login`
- **Vercel production**: `/api/auth/login` (same domain)

## ⚠️ Common Deployment Mistakes

### 1. Python Backend Errors

❌ **Problem**: `ModuleNotFoundError: No module named 'mangum'`
✅ **Solution**: Ensure `mangum==0.17.0` is in `requirements.txt`

❌ **Problem**: `Internal Server Error` on all API calls
✅ **Solution**: 
- Check Vercel Function Logs (Dashboard → Deployments → View Function Logs)
- Verify environment variables are set
- Check DATABASE_URL is correct

❌ **Problem**: Database tables don't exist
✅ **Solution**: Tables are created automatically via `Base.metadata.create_all(bind=engine)` in api/index.py

### 2. Frontend Not Connecting to API

❌ **Problem**: API calls go to wrong URL
✅ **Solution**: 
- Remove `REACT_APP_API_URL` from Vercel environment variables (let it auto-detect)
- Verify `vercel.json` routes configuration

❌ **Problem**: CORS errors
✅ **Solution**: 
- Update `allow_origins` in `api/index.py` to include your Vercel domain:
  ```python
  allow_origins=["https://your-app.vercel.app", "http://localhost:3000"]
  ```

### 3. CORS or Routing Issues

❌ **Problem**: 404 on `/api/*` routes
✅ **Solution**: 
- Verify `vercel.json` has correct routes configuration
- Check `/api/index.py` file exists
- Ensure Python build is in `vercel.json` builds array

❌ **Problem**: API works locally but not on Vercel
✅ **Solution**: 
- Check function timeout (Vercel free tier: 10s limit)
- Verify `mangum` adapter is imported: `from mangum import Mangum`
- Ensure handler is exported: `handler = Mangum(app)`

### 4. Environment Variables

❌ **Problem**: Environment variables not accessible in Python
✅ **Solution**: 
- Use `os.getenv("VAR_NAME")` not `os.environ["VAR_NAME"]`
- Set variables in Vercel Dashboard, NOT in vercel.json
- Redeploy after adding environment variables

## 🧪 Testing Deployment

### Test Backend API:

```bash
# Root endpoint
curl https://your-app.vercel.app/

# Register user
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Get community tasks
curl https://your-app.vercel.app/api/community-tasks
```

### Test Frontend:

1. Visit `https://your-app.vercel.app`
2. Register a new account
3. Create a task
4. Check if points are awarded

## 📊 Monitoring

- **Function Logs**: Vercel Dashboard → Deployments → View Function Logs
- **Real-time Logs**: Vercel Dashboard → Deployments → View Logs
- **Analytics**: Vercel Dashboard → Analytics

## 🔐 Security Checklist

✅ Generate strong JWT_SECRET_KEY (32+ characters)
✅ Use PostgreSQL, not SQLite for production
✅ Update CORS origins to specific domains
✅ Enable HTTPS only (Vercel does this automatically)
✅ Don't commit `.env` files to Git
✅ Rotate JWT secrets periodically
✅ Set appropriate JWT_EXPIRE_MINUTES

## 🆘 Troubleshooting

### Check Vercel Function Logs:

1. Go to Vercel Dashboard
2. Click your deployment
3. Click "View Function Logs"
4. Look for Python errors

### Test API Locally First:

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
cd api
python -c "from index import app; import uvicorn; uvicorn.run(app, host='0.0.0.0', port=8000)"

# Test
curl http://localhost:8000/
```

### Debug Frontend API Calls:

Open browser DevTools → Network tab → Check:
- Request URL (should be `/api/...` in production)
- Response status
- Response body

## 📚 Additional Resources

- [Vercel Python Documentation](https://vercel.com/docs/functions/runtimes/python)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Mangum (ASGI Adapter)](https://mangum.io/)

## 🎉 Success!

Your app should now be live at:
- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api/*`

Enjoy your deployed SafeZonePH application! 🚀
