# Inventory Management System

A full-stack inventory management system built with Angular 17+ frontend and Express.js backend.

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### Setup

1. **Clone the repository** (if applicable)

2. **Install dependencies for both projects**:
   ```bash
   npm run install:all
   ```

3. **Configure Backend**:
   
   Create `backend/.env` file:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/inventory_db
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:4200
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   ```

4. **Start Backend** (Terminal 1):
   ```bash
   npm run dev:backend
   ```
   Backend runs on: http://localhost:3000

5. **Start Frontend** (Terminal 2):
   ```bash
   npm run dev:frontend
   ```
   Frontend runs on: http://localhost:4200

## Project Structure

```
.
├── backend/              # Express.js + TypeScript + MongoDB backend
│   ├── src/
│   │   ├── app.ts       # Express app configuration
│   │   ├── server.ts    # Server entry point
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── middleware/  # Express middleware
│   └── package.json
│
├── frontend/            # Angular 17+ frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/    # Core services, guards, interceptors
│   │   │   ├── features/# Feature modules
│   │   │   └── shared/  # Shared components
│   │   └── styles.scss
│   └── package.json
│
└── CONNECTION_GUIDE.md  # Detailed connection guide
```

## Available Scripts

### Root Level
- `npm run install:all` - Install dependencies for both projects
- `npm run dev:backend` - Start backend in development mode
- `npm run dev:frontend` - Start frontend in development mode
- `npm run build:backend` - Build backend for production
- `npm run build:frontend` - Build frontend for production
- `npm run build:all` - Build both projects

### Backend (`cd backend`)
- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Frontend (`cd frontend`)
- `npm start` - Start development server
- `npm run build` - Build for production

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## Features

### Backend
- Express.js with TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Role-Based Access Control (RBAC)
- Input Validation (Joi)
- Error Handling
- Request Logging (Winston)
- Security Middleware (Helmet, CORS, Rate Limiting)
- API Documentation (Swagger)

### Frontend
- Angular 17+ with Standalone Components
- Strict TypeScript
- JWT Authentication
- Route Guards
- HTTP Interceptors
- Role-Based Access Control
- Responsive UI
- Modern Design

## User Roles

- **ADMIN**: Full access to all features
- **MANAGER**: Dashboard, Sales, Staff management
- **WAREHOUSE**: Products management
- **USER**: Basic access (default)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (paginated)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/low-stock` - Get low stock products

### Sales
- `GET /api/sales` - Get all sales (paginated)
- `POST /api/sales` - Create sale
- `GET /api/sales/daily-report` - Get daily sales report
- `GET /api/sales/monthly-report` - Get monthly sales report

### Staff
- `GET /api/staff` - Get all staff (paginated)
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Security headers (Helmet)
- Token blacklisting for logout

## Documentation

- [Connection Guide](./CONNECTION_GUIDE.md) - Detailed guide on connecting frontend and backend
- [Backend API Documentation](./backend/API_DOCUMENTATION.md) - Complete API documentation
- [Backend Analysis](./backend/BACKEND_ANALYSIS.md) - Backend code analysis
- [Frontend Architecture](./frontend/ARCHITECTURE.md) - Frontend architecture details

## Troubleshooting

See [CONNECTION_GUIDE.md](./CONNECTION_GUIDE.md) for troubleshooting tips.

Common issues:
- **CORS errors**: Check CORS_ORIGIN in backend `.env`
- **Connection refused**: Ensure backend is running on port 3000
- **401 Unauthorized**: Check JWT tokens in localStorage
- **MongoDB connection**: Verify MONGODB_URI in `.env`

## License

ISC
