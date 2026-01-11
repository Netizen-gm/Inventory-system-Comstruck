# Quick Setup Guide

## Connect Frontend and Backend

The frontend and backend are already configured to work together. Follow these steps:

### 1. Backend Setup

**Create `.env` file in `backend/` directory:**

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/inventory_db
JWT_SECRET=your-super-secret-jwt-key-change-this-minimum-32-characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### 2. Install Dependencies

**Option A: Install all at once (from project root):**
```bash
npm run install:all
```

**Option B: Install separately:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Start Both Services

**Option A: Run both together (recommended):**
```bash
# From project root
npm run dev
```

This will start:
- Backend on http://localhost:3000
- Frontend on http://localhost:4200

**Option B: Run separately (in separate terminals):**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 4. Verify Connection

1. **Backend Health Check:**
   - Visit: http://localhost:3000/health
   - Should return: `{"status":"OK","database":"connected",...}`

2. **Frontend:**
   - Visit: http://localhost:4200
   - Should show login page

3. **Test Authentication:**
   - Register a new user at http://localhost:4200/auth/register
   - Or login at http://localhost:4200/auth/login
   - Check browser DevTools → Network tab to see API requests

### 5. API Documentation

- **Swagger UI:** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/health

## Configuration Summary

### Backend Configuration
- **CORS**: Configured to allow `http://localhost:4200`
- **Port**: 3000 (default)
- **API Base**: `/api`
- **JWT**: Configured with access/refresh tokens

### Frontend Configuration
- **API URL**: `http://localhost:3000/api` (configured in `frontend/src/app/core/config/api.config.ts`)
- **Port**: 4200 (Angular default)
- **JWT Interceptor**: Automatically attaches tokens to requests
- **Error Interceptor**: Handles 401 errors and redirects to login

## Available Scripts

From project root:

```bash
npm run dev              # Run both backend and frontend together
npm run dev:backend      # Run only backend
npm run dev:frontend     # Run only frontend
npm run install:all      # Install dependencies for both projects
npm run build:all        # Build both projects for production
```

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN=http://localhost:4200` in backend `.env`
- Restart backend after changing `.env`

### Connection Refused
- Verify backend is running: `curl http://localhost:3000/health`
- Check MongoDB connection
- Verify port 3000 is not in use

### 401 Unauthorized
- Check tokens in browser localStorage
- Try logging out and logging back in
- Verify JWT_SECRET in backend `.env`

### MongoDB Connection
- **Local MongoDB**: Ensure MongoDB service is running
- **MongoDB Atlas**: Verify connection string and IP whitelist

For more details, see [CONNECTION_GUIDE.md](./CONNECTION_GUIDE.md)

## You're All Set!

The frontend and backend are now connected and ready to use!

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api
- API Docs: http://localhost:3000/api-docs

