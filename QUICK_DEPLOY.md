# Quick Deployment Steps

## Prerequisites Checklist

- [ ] GitHub account created
- [ ] Railway account created (https://railway.app - sign in with GitHub)
- [ ] Vercel account created (https://vercel.com - sign in with GitHub)
- [ ] MongoDB Atlas account created (https://www.mongodb.com/cloud/atlas)

## Step 1: Push to GitHub (5 minutes)

### Option A: Use PowerShell Script
```powershell
cd "C:\Users\Desktop\Desktop\Web Project"
.\setup-git.ps1
```

### Option B: Manual Commands
```bash
cd "C:\Users\Desktop\Desktop\Web Project"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up MongoDB Atlas (5 minutes)

1. **Create Cluster**
   - Go to https://cloud.mongodb.com
   - Create free cluster
   - Wait for deployment (~5 minutes)

2. **Database Access**
   - Database Access → Add New Database User
   - Username: `admin` (or your choice)
   - Password: Generate strong password (save it!)
   - Database User Privileges: Atlas Admin

3. **Network Access**
   - Network Access → Add IP Address
   - Allow Access from Anywhere: `0.0.0.0/0`

4. **Get Connection String**
   - Database → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `inventory_db`
   - Example: `mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/inventory_db?retryWrites=true&w=majority`

## Step 3: Deploy Backend to Railway (10 minutes)

1. **Connect Repository**
   - Go to https://railway.app
   - New Project → Deploy from GitHub repo
   - Select your repository
   - Set Root Directory to: `backend`

2. **Set Environment Variables**
   - Go to Variables tab
   - Add these variables:

   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory_db?retryWrites=true&w=majority
   JWT_SECRET=<generate-32-char-random-string>
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-frontend.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   ```

3. **Generate JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Deploy**
   - Railway auto-deploys on push
   - Wait for deployment (2-3 minutes)
   - Copy your Railway URL (e.g., `https://inventory-backend.up.railway.app`)

## Step 4: Deploy Frontend to Vercel (5 minutes)

1. **Import Project**
   - Go to https://vercel.com
   - Add New Project → Import Git Repository
   - Select your repository
   - Configure:
     - Framework Preset: Angular
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist/frontend`

2. **Set Environment Variable**
   - Go to Settings → Environment Variables
   - Add:
     - Name: `NG_APP_API_URL`
     - Value: `https://your-railway-url.railway.app/api`
     - Replace `your-railway-url` with your actual Railway URL

3. **Deploy**
   - Click Deploy
   - Wait for deployment (2-3 minutes)
   - Copy your Vercel URL (e.g., `https://inventory-frontend.vercel.app`)

## Step 5: Update CORS (2 minutes)

1. **Go back to Railway**
   - Variables tab
   - Update `CORS_ORIGIN` with your Vercel URL
   - Railway will auto-redeploy

## Step 6: Create Admin User (2 minutes)

### Option A: Railway Console
1. Go to Railway → Your Service → Settings → Console
2. Run:
   ```bash
   npm run seed:admin
   ```

### Option B: Environment Variables
1. Add to Railway Variables:
   ```env
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=Admin1234
   ```
2. Use Railway console or CLI to run seed script

## Step 7: Update Frontend Environment (2 minutes)

1. **Update `frontend/src/environments/environment.prod.ts`**
   - Replace `your-backend-url.railway.app` with actual Railway URL
   - Commit and push:
   ```bash
   git add .
   git commit -m "Update production API URL"
   git push
   ```
   - Vercel will auto-redeploy

## Step 8: Test Your Live App!

- **Frontend:** https://your-app.vercel.app
- **Backend Health:** https://your-backend.railway.app/health
- **API Docs:** https://your-backend.railway.app/api-docs

## Environment Variables Reference

### Railway (Backend)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<32-char-random-string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Vercel (Frontend)
```
NG_APP_API_URL=https://your-backend.railway.app/api
```

## Troubleshooting

### CORS Errors
- Verify `CORS_ORIGIN` in Railway matches your Vercel URL exactly
- Check for trailing slashes
- Ensure both URLs use HTTPS

### MongoDB Connection Issues
- Verify connection string format
- Check password is URL-encoded if it has special characters
- Verify Network Access allows all IPs (0.0.0.0/0)

### Build Failures
- Check Railway/Vercel build logs
- Verify Node.js version (requires 20+)
- Ensure all dependencies are in package.json

### Environment Variables Not Working
- Railway: Variables are available immediately
- Vercel: Redeploy after adding variables
- Angular: Environment variables are injected at build time

## Support Links

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
