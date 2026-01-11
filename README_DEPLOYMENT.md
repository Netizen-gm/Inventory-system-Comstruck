# Quick Deployment Checklist

## Before Deployment

1. ✅ Code is pushed to GitHub
2. ✅ MongoDB Atlas cluster is created
3. ✅ Environment variables are documented

## Deployment Steps

1. **MongoDB Atlas Setup** (5 minutes)
   - Create cluster
   - Configure network access (0.0.0.0/0 for now)
   - Get connection string
   - Create database user

2. **Railway Backend** (10 minutes)
   - Connect GitHub repo
   - Set environment variables
   - Deploy
   - Get backend URL

3. **Vercel Frontend** (5 minutes)
   - Connect GitHub repo
   - Set `NG_APP_API_URL` environment variable
   - Deploy
   - Get frontend URL

4. **Update CORS** (2 minutes)
   - Update Railway `CORS_ORIGIN` with Vercel URL

5. **Create Admin User** (2 minutes)
   - Run seed script or use Railway console

**Total Time: ~25 minutes**

## Quick Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Git Initial Push
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Check Backend Health
```bash
curl https://your-backend.railway.app/health
```

## Important URLs

After deployment, you'll have:
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-app.railway.app`
- **API Docs:** `https://your-app.railway.app/api-docs`
- **Health Check:** `https://your-app.railway.app/health`
