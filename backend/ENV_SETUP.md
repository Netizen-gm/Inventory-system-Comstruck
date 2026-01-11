# Environment Variables Setup Guide

## .env File Created

A `.env` file has been created in the `backend/` directory with default configuration values.

## Required Configuration

### 1. MongoDB Connection

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/inventory_db
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory_db?retryWrites=true&w=majority
```

**To use MongoDB Atlas:**
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create a database user
4. Whitelist your IP address (or 0.0.0.0/0 for development)
5. Get your connection string and replace `username`, `password`, and `cluster.mongodb.net` with your values

### 2. JWT Secret (IMPORTANT!)

**Current value is a placeholder. Generate a secure secret:**

```bash
# Generate a secure random secret (32 bytes = 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value and replace `JWT_SECRET` in `.env` file.

**For Production:**
- Use a strong, random secret (minimum 32 characters)
- Never commit the secret to version control
- Use environment variables or secrets management

### 3. CORS Configuration

The default configuration allows:
- `http://localhost:4200` (Angular frontend default port)
- `http://localhost:3000` (Backend default port)

**For Production:**
```env
CORS_ORIGIN=https://your-production-domain.com
```

### 4. Other Configuration

Most other values have sensible defaults:
- **PORT**: 3000 (backend port)
- **NODE_ENV**: development (use `production` for production)
- **JWT_ACCESS_EXPIRES_IN**: 15m (access token expiration)
- **JWT_REFRESH_EXPIRES_IN**: 7d (refresh token expiration)
- **RATE_LIMIT_WINDOW_MS**: 900000 (15 minutes)
- **RATE_LIMIT_MAX_REQUESTS**: 100 (requests per window)
- **LOG_LEVEL**: info (logging level)

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment (development/production/test) |
| `MONGODB_URI` | **Yes** | - | MongoDB connection string |
| `JWT_SECRET` | **Yes** | - | JWT signing secret (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | No | 15m | Access token expiration |
| `JWT_REFRESH_EXPIRES_IN` | No | 7d | Refresh token expiration |
| `CORS_ORIGIN` | No | http://localhost:4200 | Allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | No | 900000 | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | No | 100 | Max requests per window |
| `LOG_LEVEL` | No | info | Logging level (error/warn/info/debug) |

## Setup Steps

1. **Edit `.env` file** in `backend/` directory
2. **Update `MONGODB_URI`** with your MongoDB connection string
3. **Generate and update `JWT_SECRET`** with a secure random value
4. **Verify `CORS_ORIGIN`** matches your frontend URL
5. **Save the file**
6. **Start the backend**: `npm run dev`

## Security Notes

**IMPORTANT:**
- `.env` file is already in `.gitignore` - never commit it to version control
- Use strong, random secrets in production
- Never share your `.env` file or secrets
- Use different secrets for development and production
- Consider using environment variable management in production (e.g., AWS Secrets Manager, Azure Key Vault)

## Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running (if local)
- Check connection string format
- For Atlas: verify IP whitelist includes your IP
- Check database user credentials

### JWT Secret Error
- Ensure JWT_SECRET is at least 32 characters
- Generate a new secret if needed
- Restart the server after changing JWT_SECRET

### CORS Errors
- Ensure CORS_ORIGIN includes your frontend URL
- Check for typos in the URL
- Restart server after changing CORS_ORIGIN

## Next Steps

1. `.env` file created
2. Update `MONGODB_URI` with your MongoDB connection
3. Generate and update `JWT_SECRET` with a secure value
4. Verify other settings
5. Start backend: `npm run dev`

Happy coding! 🚀
