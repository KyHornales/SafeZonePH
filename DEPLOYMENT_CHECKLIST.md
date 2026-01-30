# 🎯 Vercel Deployment Checklist

Use this checklist to ensure successful deployment.

---

## ✅ Pre-Deployment Checklist

### Files Created/Updated:
- [ ] `/api/index.py` exists ✅ (auto-created)
- [ ] `/requirements.txt` exists in root ✅ (auto-created)
- [ ] `/vercel.json` updated with Python build ✅ (auto-updated)
- [ ] `/.env.example` has backend variables ✅ (auto-updated)
- [ ] `/src/config/api.config.ts` exists ✅ (auto-created)

### Required Manual Changes:
- [ ] **IMPORTANT**: Update `src/services/api.ts` line 1
  - Change from: `const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';`
  - Change to: `import { API_BASE_URL } from '../config/api.config';`
  - See `UPDATE_API_SERVICE.md` for details

### Local Testing:
- [ ] Run backend locally (`cd backend/app && python main.py`)
- [ ] Run frontend locally (`npm start`)
- [ ] Test registration works
- [ ] Test creating tasks works
- [ ] Test completing tasks awards points

---

## 🚀 Deployment Checklist

### 1. Prepare Repository:
- [ ] Commit all changes to Git
- [ ] Push to GitHub/GitLab/Bitbucket

### 2. Vercel Account Setup:
- [ ] Create/login to Vercel account at [vercel.com](https://vercel.com)
- [ ] Connect Git provider (GitHub/GitLab/Bitbucket)

### 3. Import Project:
- [ ] Click "New Project" in Vercel Dashboard
- [ ] Select your SafeZonePH repository
- [ ] Vercel auto-detects framework (React)

### 4. Configure Build Settings (Usually Auto-Detected):
- [ ] Framework Preset: Create React App
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `build`
- [ ] Install Command: `npm install`

### 5. Set Environment Variables:

#### Required Variables:
- [ ] `JWT_SECRET_KEY` = Generate strong random key (32+ chars)
  ```bash
  # Generate with:
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

- [ ] `DATABASE_URL` = Your database connection string
  - Vercel Postgres: Get from Storage tab
  - Supabase: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
  - Testing only: `sqlite:///./safezoneph_prod.db`

#### Optional Variables:
- [ ] `JWT_ALGORITHM` = `HS256` (default)
- [ ] `JWT_EXPIRE_MINUTES` = `1440` (default)

### 6. Deploy:
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Check build logs for errors

---

## 🧪 Post-Deployment Testing

### 1. Test API Root:
```bash
curl https://your-app.vercel.app/
# Should return: {"message": "SafeZonePH API is running on Vercel!"}
```

### 2. Seed Community Tasks:
```bash
curl -X POST https://your-app.vercel.app/api/seed-community-tasks
# Should return: {"message": "Successfully created 3 community tasks"}
```

### 3. Test User Registration:
```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
# Should return access token and user data
```

### 4. Test Frontend:
- [ ] Visit `https://your-app.vercel.app`
- [ ] Page loads without errors
- [ ] Can navigate to login/register pages
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can create new task
- [ ] Can complete task and earn points
- [ ] Can volunteer for community tasks

### 5. Check Logs:
- [ ] Vercel Dashboard → Deployments → View Function Logs
- [ ] No errors in startup
- [ ] API calls are being logged
- [ ] Database connections successful

---

## 🐛 Troubleshooting Checklist

### If Backend API Returns 500 Error:
- [ ] Check Vercel Function Logs
- [ ] Verify `JWT_SECRET_KEY` is set
- [ ] Verify `DATABASE_URL` is set and correct
- [ ] Check `mangum` is in `requirements.txt`
- [ ] Redeploy after setting environment variables

### If Frontend Can't Connect to API:
- [ ] Check `src/services/api.ts` was updated correctly
- [ ] Clear browser cache and hard reload (Ctrl+Shift+R)
- [ ] Check browser console for errors
- [ ] Verify Network tab shows requests to `/api/...`

### If CORS Errors:
- [ ] Update `api/index.py` `allow_origins` to include your Vercel domain
- [ ] Redeploy after changes

### If Database Errors:
- [ ] Verify `DATABASE_URL` format is correct
- [ ] For PostgreSQL: Ensure database exists
- [ ] Check Function Logs for SQLAlchemy errors
- [ ] Tables should auto-create on first API call

---

## 📊 Success Criteria

Your deployment is successful when:

✅ Frontend loads at `https://your-app.vercel.app`
✅ API responds at `https://your-app.vercel.app/api/`
✅ User registration works
✅ Login works and returns JWT token
✅ Tasks can be created and completed
✅ Points are awarded correctly
✅ Community tasks appear and volunteer function works
✅ No errors in Vercel Function Logs

---

## 🔄 Redeployment Checklist

When making changes:

- [ ] Test changes locally first
- [ ] Commit and push to Git
- [ ] Vercel auto-deploys on push (if enabled)
- [ ] Or manually redeploy in Vercel Dashboard
- [ ] Check deployment logs
- [ ] Test production URL

---

## 📞 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **Mangum (ASGI Adapter)**: https://mangum.io/
- **Vercel Function Logs**: Dashboard → Deployments → View Function Logs
- **Full Guide**: See `DEPLOYMENT.md`

---

## ✨ Deployment Commands Quick Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>

# Set environment variable
vercel env add JWT_SECRET_KEY

# Pull environment variables locally
vercel env pull
```

---

## 🎉 You're Done!

Once all checkboxes are ✅, your SafeZonePH app is fully deployed on Vercel!

**Your live URLs:**
- Frontend: `https://your-app.vercel.app`
- API: `https://your-app.vercel.app/api/`

Share it with your team and start helping the community! 💚
