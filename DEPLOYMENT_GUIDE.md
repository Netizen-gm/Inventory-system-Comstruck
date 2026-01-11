# Deployment Guide - Railway (Backend) & Vercel (Frontend)

This guide will help you deploy your Inventory Management System to production.

## Prerequisites

- GitHub account
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)

## Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account
   - Create a new cluster (choose FREE tier)

2. **Configure Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Create a user with username and password (save these!)
   - Set privileges to "Atlas Admin" or "Read and write to any database"

3. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - For production, add specific IPs if needed

4. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `inventory_db` (or your preferred database name)
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/inventory_db?retryWrites=true&w=majority`

## Step 2: Push Code to GitHub

### Initialize Git Repository

```bash
# Navigate to project root
cd "C:\Users\Desktop\Desktop\Web Project"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Inventory Management System"

# Create a new repository on GitHub (via web interface)
# Then add remote and push:

git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**Note:** Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## Step 3: Deploy Backend to Railway

### Option A: Using Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Create New Project**
   ```bash
   railway init
   ```

4. **Link to Repository** (if using GitHub)
   ```bash
   railway link
   ```

### Option B: Using Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` folder as the root

3. **Configure Environment Variables**
   - Go to your service → "Variables" tab
   - Add the following environment variables:

   ```env
   PORT=3000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/inventory_db?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   ```

4. **Generate JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Use this output as your `JWT_SECRET`

5. **Deploy**
   - Railway will automatically detect Node.js and deploy
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://your-app.up.railway.app`)

6. **Update CORS_ORIGIN**
   - After deploying frontend (Step 4), come back and update `CORS_ORIGIN` with your Vercel URL

## Step 4: Deploy Frontend to Vercel

### Option A: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

### Option B: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset:** Angular
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist/inventory-management-system` (or check your angular.json)

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NG_APP_API_URL=https://your-backend-url.railway.app/api
     ```
   - Replace `your-backend-url.railway.app` with your actual Railway backend URL

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL (e.g., `https://your-app.vercel.app`)

5. **Update Backend CORS**
   - Go back to Railway
   - Update `CORS_ORIGIN` environment variable with your Vercel URL
   - Railway will automatically redeploy

## Step 5: Update Frontend Environment

After deploying, update your frontend environment file:

1. **Update `frontend/src/environments/environment.prod.ts`**
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend-url.railway.app/api',
   };
   ```

2. **Redeploy Frontend** (if needed)

## Step 6: Create Admin User

After deployment, create an admin user:

1. **SSH into Railway** (optional, or use Railway's console)
   ```bash
   railway shell
   ```

2. **Run Seed Script**
   ```bash
   cd backend
   npm run seed:admin
   ```
   
   Or set environment variables in Railway:
   ```
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=Admin1234
   ```
   
   Then run the seed script via Railway's console or CLI.

## Step 7: Test Your Deployment

1. **Frontend:** Visit your Vercel URL
2. **Backend API:** Visit `https://your-backend-url.railway.app/health`
3. **API Docs:** Visit `https://your-backend-url.railway.app/api-docs`

## Troubleshooting

### Backend Issues

1. **Port Configuration**
   - Railway automatically sets `PORT` environment variable
   - Ensure your code uses `process.env.PORT || 3000`

2. **MongoDB Connection**
   - Verify connection string is correct
   - Check Network Access in MongoDB Atlas
   - Ensure password is URL-encoded if it contains special characters

3. **CORS Errors**
   - Verify `CORS_ORIGIN` includes your Vercel URL
   - Check for trailing slashes
   - Ensure both frontend and backend URLs are correct

### Frontend Issues

1. **API Connection**
   - Verify `NG_APP_API_URL` environment variable is set
   - Check browser console for CORS errors
   - Ensure backend is deployed and accessible

2. **Build Errors**
   - Check build logs in Vercel
   - Verify all dependencies are in `package.json`
   - Ensure Node.js version is compatible

## Environment Variables Summary

### Backend (Railway)
- `PORT` - Railway sets this automatically
- `NODE_ENV=production`
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Secure random string (32+ characters)
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `CORS_ORIGIN` - Your Vercel frontend URL
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX_REQUESTS=100`
- `LOG_LEVEL=info`

### Frontend (Vercel)
- `NG_APP_API_URL` - Your Railway backend URL + `/api`

## Additional Configuration

### Custom Domain (Optional)

**Railway:**
- Go to your service → Settings → Domains
- Add custom domain

**Vercel:**
- Go to Project Settings → Domains
- Add custom domain
- Update `NG_APP_API_URL` and `CORS_ORIGIN` accordingly

### Continuous Deployment

Both Railway and Vercel automatically deploy when you push to GitHub:
- **Railway:** Deploys on push to main branch (configure in settings)
- **Vercel:** Deploys on push to main branch (configure in project settings)

## Security Checklist

- [ ] Strong JWT_SECRET (32+ characters, random)
- [ ] MongoDB password is strong
- [ ] CORS_ORIGIN is set to your specific frontend URL
- [ ] Environment variables are set in Railway/Vercel (not in code)
- [ ] `.env` files are in `.gitignore`
- [ ] HTTPS is enabled (automatic with Railway/Vercel)
- [ ] MongoDB Network Access is configured (not 0.0.0.0/0 for production)

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
