# 📋 Quick Reference: Vercel Deployment Commands

## 🎯 One-Time Setup (Do Once)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Generate JWT Secret Key
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy output - you'll need this!
```

---

## 🚀 Deploy to Vercel

### Method 1: Via Git (Recommended)

```bash
# Commit and push
git add .
git commit -m "Ready for Vercel deployment"
git push origin main

# Vercel auto-deploys from Git (if connected)
```

### Method 2: Via CLI

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

---

## ⚙️ Environment Variables

### Set via CLI:

```bash
# Set JWT secret
vercel env add JWT_SECRET_KEY production
# Paste your generated key when prompted

# Set database URL
vercel env add DATABASE_URL production
# Paste your PostgreSQL connection string
```

### Set via Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - `JWT_SECRET_KEY` = `<your-secret-key>`
   - `DATABASE_URL` = `<your-database-url>`

---

## 🧪 Test Deployment

```bash
# Test API root
curl https://your-app.vercel.app/

# Seed community tasks
curl -X POST https://your-app.vercel.app/api/seed-community-tasks

# Test registration
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🐛 Debug Issues

```bash
# View recent logs
vercel logs <deployment-url>

# View logs in real-time
vercel logs <deployment-url> --follow

# List all deployments
vercel ls

# Get deployment details
vercel inspect <deployment-url>
```

---

## 📦 Local Testing Before Deploy

```bash
# Build frontend locally
npm run build

# Test production build locally
npx serve -s build

# Install Python dependencies
pip install -r requirements.txt

# Test serverless function locally (simulate Vercel)
cd api
python -c "from index import app; import uvicorn; uvicorn.run(app, port=8000)"
```

---

## 🔄 Redeploy After Changes

```bash
# 1. Make changes
# 2. Test locally
npm start

# 3. Commit
git add .
git commit -m "Updated feature X"

# 4. Push (auto-deploys if connected)
git push origin main

# OR deploy via CLI
vercel --prod
```

---

## 🗄️ Database Setup

### Vercel Postgres:

```bash
# Create database in Vercel dashboard
# Storage → Create Database → Postgres

# Get connection string
# Copy from Database → Settings → Connection String

# Format:
postgres://username:password@host:5432/database
```

### Supabase (Free PostgreSQL):

```bash
# 1. Create account at supabase.com
# 2. Create new project
# 3. Get connection string from Settings → Database
# Format:
postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres
```

---

## 🔐 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `JWT_SECRET_KEY` | Secret for JWT tokens | ✅ Yes | `your-random-32-char-string` |
| `DATABASE_URL` | Database connection | ✅ Yes | `postgresql://...` |
| `JWT_ALGORITHM` | Hash algorithm | ❌ No | `HS256` (default) |
| `JWT_EXPIRE_MINUTES` | Token lifetime | ❌ No | `1440` (default) |

---

## 📊 Vercel CLI Commands

```bash
# Deployment
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel --force           # Force redeploy

# Projects
vercel ls                # List deployments
vercel projects ls       # List projects
vercel alias             # Manage domains

# Environment
vercel env ls            # List environment variables
vercel env add VAR       # Add variable
vercel env rm VAR        # Remove variable
vercel env pull          # Download to .env.local

# Logs & Debug
vercel logs URL          # View logs
vercel logs URL -f       # Follow logs
vercel inspect URL       # Deployment details

# Domains
vercel domains ls        # List domains
vercel domains add       # Add custom domain

# Cleanup
vercel rm DEPLOYMENT     # Remove deployment
```

---

## 🎯 Deployment Checklist (Quick)

```bash
# ✅ Pre-deployment
□ Updated src/services/api.ts
□ Tested locally
□ Committed all changes

# ✅ Deploy
□ vercel --prod

# ✅ Configure
□ Set JWT_SECRET_KEY
□ Set DATABASE_URL
□ Redeploy if needed

# ✅ Test
□ Visit https://your-app.vercel.app
□ Test registration
□ Test login
□ Seed community tasks
```

---

## 🆘 Common Fixes

### "Module not found" error:
```bash
# Ensure requirements.txt is in root
cat requirements.txt
# Should include mangum==0.17.0
```

### "Cannot connect to database":
```bash
# Check DATABASE_URL is set
vercel env ls

# Test connection string format
# PostgreSQL: postgresql://user:pass@host:5432/db
```

### "API returns 500":
```bash
# Check function logs
vercel logs <url> --follow

# Common issues:
# - Missing environment variables
# - Wrong DATABASE_URL format
# - Missing dependencies in requirements.txt
```

### "CORS error":
```typescript
// Update api/index.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app"],
    # ... rest
)
```

---

## 📱 Mobile Testing

```bash
# Get your deployment URL
vercel ls

# Test on mobile device:
# 1. Open browser on phone
# 2. Visit https://your-app.vercel.app
# 3. Test all features
```

---

## 🔗 Useful URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Your Deployments**: https://vercel.com/dashboard
- **Function Logs**: Dashboard → Project → Deployments → Logs
- **Environment Vars**: Dashboard → Project → Settings → Environment Variables

---

## 💡 Pro Tips

1. **Use Git auto-deploy**: Connect GitHub for automatic deployments
2. **Preview URLs**: Every push gets unique preview URL
3. **Rollback**: Click previous deployment → "Promote to Production"
4. **Custom domain**: Settings → Domains → Add your domain
5. **Analytics**: Enable Analytics in project settings
6. **Edge Config**: Use for feature flags and fast lookups

---

## ⚡ Performance Tips

```bash
# Enable caching for static assets
# Already configured in vercel.json ✅

# Use Edge Functions (faster)
# Python functions run in US East by default

# Monitor function execution time
vercel logs <url> | grep "Duration"

# Optimize cold starts
# - Keep dependencies minimal
# - Use connection pooling for database
```

---

## 🎉 You're Ready!

Keep this file handy for quick reference while deploying.

**Next steps:**
1. Follow `DEPLOYMENT_CHECKLIST.md`
2. Read `DEPLOYMENT.md` for details
3. Check `ARCHITECTURE.md` to understand setup

Happy deploying! 🚀
