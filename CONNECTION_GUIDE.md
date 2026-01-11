# Frontend-Backend Connection Guide

This guide explains how to connect and run the Angular frontend with the Express backend.

## Prerequisites

1. **Backend Requirements**:
   - Node.js 20+
   - MongoDB (local or MongoDB Atlas)
   - Environment variables configured

2. **Frontend Requirements**:
   - Node.js 18+
   - Angular CLI 17+

## Configuration

### Backend Configuration

The backend is already configured to accept requests from the Angular frontend:

- **CORS**: Configured to allow `http://localhost:4200` (Angular default port)
- **API Base URL**: `http://localhost:3000/api`
- **Port**: 3000 (default, configurable via `PORT` env variable)

### Frontend Configuration

The frontend is already configured to connect to the backend:

- **API Base URL**: `http://localhost:3000/api` (configured in `frontend/src/app/core/config/api.config.ts`)
- **Port**: 4200 (Angular default)

## Setup Steps

### 1. Backend Setup

#### Create `.env` file in `backend/` directory:

```bash
# Navigate to backend directory
cd backend

# Create .env file (copy from .env.example if it exists)
# Or create manually with these variables:
```

Required environment variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/inventory_db
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:4200,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

#### Install dependencies and start backend:

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:3000`

### 2. Frontend Setup

#### Install dependencies and start frontend:

```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:4200`

## Verification

### 1. Check Backend is Running

Visit these URLs in your browser:
- Health Check: http://localhost:3000/health
- API Docs: http://localhost:3000/api-docs

### 2. Check Frontend Connection

1. Open http://localhost:4200 in your browser
2. The frontend should load the login page
3. Open browser DevTools (F12) → Network tab
4. Try to register or login
5. Check that API requests are being made to `http://localhost:3000/api/*`

### 3. Test Authentication Flow

1. **Register a new user**:
   - Go to http://localhost:4200/auth/register
   - Fill in the registration form
   - Submit (should redirect to dashboard on success)

2. **Login**:
   - Go to http://localhost:4200/auth/login
   - Enter credentials
   - Submit (should redirect to dashboard on success)

3. **Verify JWT tokens**:
   - Open browser DevTools → Application/Storage → Local Storage
   - You should see `access_token` and `refresh_token` stored
   - Check that subsequent API requests include `Authorization: Bearer <token>` header

## API Endpoints Mapping

The frontend automatically connects to these backend endpoints:

| Frontend Service | Backend Endpoint | Method |
|-----------------|------------------|--------|
| AuthService.login() | `/api/auth/login` | POST |
| AuthService.register() | `/api/auth/register` | POST |
| AuthService.refreshToken() | `/api/auth/refresh` | POST |
| AuthService.logout() | `/api/auth/logout` | POST |
| ProductsService.getAll() | `/api/products` | GET |
| SalesService.getAll() | `/api/sales` | GET |
| StaffService.getAll() | `/api/staff` | GET |
| DashboardService.getStats() | `/api/dashboard/stats` | GET |

## Troubleshooting

### CORS Errors

**Problem**: Browser shows CORS errors when making API requests.

**Solution**:
1. Ensure backend `.env` file includes: `CORS_ORIGIN=http://localhost:4200`
2. Restart the backend server after changing `.env`
3. Check that frontend is running on port 4200 (Angular default)

### Connection Refused

**Problem**: Frontend can't connect to backend (ECONNREFUSED).

**Solution**:
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check backend port matches frontend config (`frontend/src/app/core/config/api.config.ts`)
3. Ensure no firewall is blocking port 3000

### 401 Unauthorized Errors

**Problem**: API requests return 401 Unauthorized.

**Solution**:
1. Check that user is logged in (check localStorage for tokens)
2. Verify tokens are being sent in Authorization header (check Network tab)
3. Try logging out and logging back in
4. Check backend JWT_SECRET is configured

### 404 Not Found

**Problem**: API endpoints return 404.

**Solution**:
1. Verify backend routes are registered correctly
2. Check API base URL in `frontend/src/app/core/config/api.config.ts`
3. Ensure backend is running and accessible
4. Check backend logs for route registration

### MongoDB Connection Issues

**Problem**: Backend fails to start or connect to database.

**Solution**:
1. Verify MongoDB is running (if local): `mongod --version`
2. Check MONGODB_URI in `.env` file is correct
3. For MongoDB Atlas, ensure IP whitelist includes your IP
4. Test connection: `mongosh "your-connection-string"`

## Running Both Services

### Option 1: Separate Terminals (Recommended for Development)

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

### Option 2: Concurrently (Optional)

You can use `concurrently` to run both services from a single command:

```bash
# Install concurrently globally
npm install -g concurrently

# From project root
concurrently "npm run dev --prefix backend" "npm start --prefix frontend"
```

Or add scripts to root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm start --prefix frontend\"",
    "backend": "npm run dev --prefix backend",
    "frontend": "npm start --prefix frontend"
  }
}
```

## Production Deployment

For production:

1. **Backend**:
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET` (32+ characters)
   - Configure production MongoDB URI
   - Update CORS_ORIGIN to production frontend URL
   - Use process manager (PM2, systemd, etc.)

2. **Frontend**:
   - Update `api.config.ts` with production API URL
   - Build: `npm run build`
   - Deploy `dist/` folder to web server (nginx, Apache, etc.)
   - Configure reverse proxy if needed

## Security Notes

- **Development**: CORS allows `http://localhost:4200` by default
- **Production**: Update `CORS_ORIGIN` in backend `.env` to your production frontend URL
- **JWT Secret**: Never commit `.env` file. Use strong, random secrets in production
- **HTTPS**: Use HTTPS in production for both frontend and backend

## Next Steps

1. Backend and frontend are configured to work together
2. Start both services
3. Test authentication flow
4. Verify API requests in browser DevTools
5. Test all features (dashboard, products, sales, staff)
