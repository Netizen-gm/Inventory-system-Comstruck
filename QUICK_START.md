# Quick Start Guide - Frontend & Backend Connection

## Configuration Status

Your frontend and backend are **already configured** to work together!

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:4200
- **CORS**: Configured to allow frontend requests
- **API Base URL**: `http://localhost:3000/api`

## Start Both Services

### Option 1: Run Together (Recommended)

From the **project root**:

```bash
npm run dev
```

This starts both:
- Backend on http://localhost:3000
- Frontend on http://localhost:4200

### Option 2: Run Separately

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

## Verify Connection

1. **Backend Health Check**
   - Visit: http://localhost:3000/health
   - Should show: `{"status":"OK","database":"connected",...}`

2. **Frontend**
   - Visit: http://localhost:4200
   - Should show login/register page

3. **API Documentation**
   - Visit: http://localhost:3000/api-docs
   - Should show Swagger UI

4. **Test Authentication**
   - Register a new user or login
   - Check browser DevTools → Network tab
   - Verify API requests to `http://localhost:3000/api/*`

## Configuration Files

### Backend
- **CORS**: `backend/.env` → `CORS_ORIGIN=http://localhost:4200`
- **Port**: `backend/.env` → `PORT=3000`

### Frontend
- **API URL**: `frontend/src/app/core/config/api.config.ts` → `baseUrl: 'http://localhost:3000/api'`
- **Port**: Angular default (4200)

## Available Scripts

From project root:

```bash
npm run dev              # Run both services together
npm run dev:backend      # Run only backend
npm run dev:frontend     # Run only frontend
npm run install:all      # Install all dependencies
npm run build:all        # Build both for production
```

## Troubleshooting

### CORS Errors
- Verify `CORS_ORIGIN=http://localhost:4200` in `backend/.env`
- Restart backend after changing `.env`

### Connection Refused
- Check backend is running: `curl http://localhost:3000/health`
- Verify MongoDB connection

### 401 Unauthorized
- Check localStorage for tokens
- Verify JWT_SECRET in `backend/.env` is configured
- Try logging out and back in

## Everything is Ready!

Your frontend and backend are properly connected. Just run `npm run dev` from the project root to start both services!
