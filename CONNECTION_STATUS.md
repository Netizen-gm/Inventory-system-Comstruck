# Frontend-Backend Connection Status

## Configuration Summary

### Backend Configuration
- **Port**: 3000
- **CORS Origin**: `http://localhost:4200` (configured in `.env`)
- **API Base Path**: `/api`
- **JWT Secret**: Configured (64 characters)
- **Health Endpoint**: `http://localhost:3000/health`

### Frontend Configuration
- **Port**: 4200 (Angular default)
- **API Base URL**: `http://localhost:3000/api` (configured in `frontend/src/app/core/config/api.config.ts`)
- **JWT Interceptor**: Configured (automatically attaches tokens)
- **Error Interceptor**: Configured (handles 401 errors)

## Connection Flow

1. **Frontend → Backend API Requests**
   - Frontend services use `API_CONFIG.baseUrl` = `http://localhost:3000/api`
   - JWT interceptor automatically adds `Authorization: Bearer <token>` header
   - CORS middleware on backend allows requests from `http://localhost:4200`

2. **Authentication Flow**
   - User logs in → Frontend calls `POST /api/auth/login`
   - Backend returns `accessToken` and `refreshToken`
   - Frontend stores tokens in localStorage
   - Subsequent requests include tokens via JWT interceptor

3. **Error Handling**
   - 401 errors → Error interceptor clears tokens and redirects to login
   - CORS errors → Check backend `.env` CORS_ORIGIN setting
   - Network errors → Verify both services are running

## Quick Start

### Run Both Services Together

From project root:
```bash
npm run dev
```

This will start:
- Backend: http://localhost:3000
- Frontend: http://localhost:4200

### Run Separately

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

## Verification Steps

1. **Check Backend Health**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"OK","database":"connected",...}`

2. **Check Frontend**
   - Open: http://localhost:4200
   - Should show login/register page

3. **Test API Connection**
   - Open browser DevTools → Network tab
   - Register/Login through frontend
   - Verify API requests are made to `http://localhost:3000/api/*`
   - Check for CORS errors in console

4. **Check API Documentation**
   - Visit: http://localhost:3000/api-docs
   - Should show Swagger UI with all API endpoints

## Files Involved in Connection

### Backend
- `backend/.env` - CORS_ORIGIN configuration
- `backend/src/app.ts` - CORS middleware setup
- `backend/src/server.ts` - Server entry point

### Frontend
- `frontend/src/app/core/config/api.config.ts` - API base URL
- `frontend/src/app/core/interceptors/jwt.interceptor.ts` - Token injection
- `frontend/src/app/core/interceptors/error.interceptor.ts` - Error handling
- `frontend/src/app/core/services/*.service.ts` - API service calls

## Troubleshooting

### CORS Errors
**Problem**: Browser console shows CORS errors

**Solution**:
1. Verify `CORS_ORIGIN=http://localhost:4200` in `backend/.env`
2. Restart backend server
3. Clear browser cache

### Connection Refused
**Problem**: Frontend can't reach backend

**Solution**:
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check firewall isn't blocking port 3000
3. Verify API URL in `api.config.ts` matches backend port

### 401 Unauthorized
**Problem**: API requests return 401

**Solution**:
1. Check localStorage for tokens (DevTools → Application → Local Storage)
2. Verify JWT_SECRET in backend `.env` is configured
3. Try logging out and logging back in

## Status: CONNECTED AND READY

The frontend and backend are properly configured to work together. Both services use the correct ports and CORS is properly configured.
