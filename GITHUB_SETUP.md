# GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `inventory-management-system` (or your preferred name)
3. Description: "Full-stack inventory management system with Angular frontend and Express backend"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Initialize Git and Push

Run these commands in your project root:

```bash
# Navigate to project root
cd "C:\Users\Desktop\Desktop\Web Project"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Inventory Management System with full CRUD functionality"

# Add remote repository (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify Push

1. Go to your GitHub repository
2. Verify all files are present
3. Check that `.env` files are NOT in the repository (they should be in .gitignore)

## Important Notes

- ✅ `.env` files are in `.gitignore` - they won't be pushed
- ✅ `node_modules/` is ignored
- ✅ `dist/` folders are ignored
- ✅ Environment variables will be set in Railway/Vercel dashboards

## Next Steps

After pushing to GitHub:
1. Follow `DEPLOYMENT_GUIDE.md` for Railway and Vercel setup
2. Connect your GitHub repository to Railway
3. Connect your GitHub repository to Vercel
