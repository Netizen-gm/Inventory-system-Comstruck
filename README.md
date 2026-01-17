# Inventory Management System

A comprehensive full-stack inventory management system built with Angular 17+ (frontend) and Express.js with TypeScript (backend). The system provides role-based access control, user management, product tracking, sales management, and staff administration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Deployment](#deployment)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

## Overview

This inventory management system enables businesses to efficiently manage products, track sales, manage staff, and monitor business metrics through a modern web interface. The system implements JWT-based authentication, role-based access control (RBAC), and provides comprehensive CRUD operations for all major entities.

### Key Capabilities

- **Product Management**: Track inventory levels, prices, categories, and stock status
- **Sales Tracking**: Record and monitor sales transactions with automatic stock updates
- **Staff Management**: Manage employee information and associate with user accounts
- **User Management**: Admin-controlled user registration, role assignment, and approval workflows
- **Dashboard Analytics**: Real-time statistics for revenue, sales, and inventory
- **Manager Approval System**: Admin approval required for manager role registrations

## Features

### Authentication & Authorization

- JWT-based authentication with access and refresh tokens
- Role-based access control (RBAC) with four user roles
- Manager registration approval workflow
- Secure password hashing with bcrypt
- Token blacklisting for logout functionality

### User Management (Admin Only)

- View all users with filtering and search
- Approve or reject manager registration requests
- Assign and revoke user roles
- Activate or deactivate user accounts
- Comprehensive user activity tracking

### Product Management

- Full CRUD operations for products
- Category-based organization
- SKU-based product identification
- Low stock and out-of-stock alerts
- Price and quantity tracking
- Product status management (in_stock, low_stock, out_of_stock, discontinued)

### Sales Management

- Record sales transactions
- Automatic inventory reduction on sale
- Multiple payment methods (cash, card, transfer, other)
- Sales reporting (daily and monthly)
- Staff association with sales
- Stock restoration on sale deletion

### Staff Management

- Employee information management
- Automatic user account creation
- Department and position tracking
- Salary and hire date management
- Employee status tracking (active/inactive)

### Dashboard

- Real-time revenue statistics (daily and monthly)
- Sales count and trends
- Inventory overview
- Low stock alerts
- Stock value calculations
- Category summaries

## Technology Stack

### Backend

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI

### Frontend

- **Framework**: Angular 17+ (Standalone Components)
- **Language**: TypeScript (Strict Mode)
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router with Guards
- **State Management**: Services with RxJS
- **Styling**: SCSS
- **Build Tool**: Angular CLI

## Prerequisites

Before installing and running this application, ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm**: Version 10 or higher (comes with Node.js)
- **MongoDB**: Version 6 or higher (local installation or MongoDB Atlas account)
- **Git**: For version control

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies

Install dependencies for both backend and frontend:

```bash
npm run install:all
```

Alternatively, install separately:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/inventory_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-please-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

**Important**: Replace `JWT_SECRET` with a strong random string (minimum 32 characters). Generate one using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend Configuration

The frontend uses environment files located in `frontend/src/environments/`:

- `environment.ts`: Development configuration
- `environment.prod.ts`: Production configuration

The API URL is configured in these files and should point to your backend URL.

## Running the Application

### Development Mode

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3000`

#### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:4200`

### Root Level Scripts

You can also use root-level scripts from the project root:

```bash
# Start backend in development mode
npm run dev:backend

# Start frontend in development mode
npm run dev:frontend
```

### Creating an Admin User

After setting up the database, create an admin user using the seed script:

```bash
cd backend
npm run seed:admin
```

Default admin credentials:
- **Email**: `admin@example.com`
- **Password**: `Admin1234`

**Security Note**: Change the default password immediately after first login in production environments.

## Project Structure

```
.
├── backend/                          # Backend Express.js application
│   ├── src/
│   │   ├── app.ts                   # Express app configuration and middleware
│   │   ├── server.ts                # Server entry point
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.ts          # MongoDB connection
│   │   │   ├── logger.ts            # Winston logger setup
│   │   │   ├── swagger.ts           # Swagger documentation config
│   │   │   └── env.validation.ts    # Environment variable validation
│   │   ├── controllers/             # Route controllers
│   │   │   ├── auth.controller.ts   # Authentication endpoints
│   │   │   ├── products.controller.ts
│   │   │   ├── sales.controller.ts
│   │   │   ├── staff.controller.ts
│   │   │   ├── user.controller.ts   # User management (admin)
│   │   │   └── dashboard.controller.ts
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.model.ts        # User schema with roles
│   │   │   ├── Product.model.ts
│   │   │   ├── Sale.model.ts
│   │   │   ├── Staff.model.ts
│   │   │   └── Token.model.ts       # JWT token blacklist
│   │   ├── routes/                  # Express routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── products.routes.ts
│   │   │   ├── sales.routes.ts
│   │   │   ├── staff.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── dashboard.routes.ts
│   │   ├── services/                # Business logic
│   │   │   ├── auth.service.ts      # Authentication logic
│   │   │   ├── products.service.ts
│   │   │   ├── sales.service.ts
│   │   │   ├── staff.service.ts
│   │   │   └── user.service.ts      # User management logic
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.ts   # JWT authentication
│   │   │   ├── role.middleware.ts   # Role-based authorization
│   │   │   ├── error.middleware.ts  # Error handling
│   │   │   ├── validation.middleware.ts  # Request validation
│   │   │   └── logger.middleware.ts # Request logging
│   │   ├── utils/                   # Utility functions
│   │   │   ├── jwt.utils.ts         # JWT token operations
│   │   │   ├── AppError.ts          # Custom error class
│   │   │   └── constants.ts         # Application constants
│   │   └── scripts/                 # Utility scripts
│   │       └── seed-admin.ts        # Admin user creation script
│   ├── .env                         # Environment variables (create this)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                        # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                # Core application logic
│   │   │   │   ├── config/          # Configuration
│   │   │   │   │   └── api.config.ts  # API endpoint configuration
│   │   │   │   ├── guards/          # Route guards
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   └── role.guard.ts
│   │   │   │   ├── interceptors/    # HTTP interceptors
│   │   │   │   │   └── jwt.interceptor.ts
│   │   │   │   ├── models/          # TypeScript interfaces/models
│   │   │   │   ├── services/        # Angular services
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── token-storage.service.ts
│   │   │   │   │   └── ... (other services)
│   │   │   │   └── utils/           # Utility functions
│   │   │   ├── features/            # Feature modules
│   │   │   │   ├── auth/            # Authentication
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── dashboard/       # Dashboard component
│   │   │   │   ├── products/        # Product management
│   │   │   │   ├── sales/           # Sales management
│   │   │   │   ├── staff/           # Staff management
│   │   │   │   └── users/           # User management (admin)
│   │   │   ├── shared/              # Shared components
│   │   │   │   └── layout/          # Main layout component
│   │   │   ├── app.routes.ts        # Application routes
│   │   │   └── app.component.ts     # Root component
│   │   ├── environments/            # Environment configurations
│   │   │   ├── environment.ts       # Development
│   │   │   └── environment.prod.ts  # Production
│   │   └── styles.scss              # Global styles
│   ├── package.json
│   └── angular.json
│
├── README.md                        # This file
└── package.json                     # Root package.json with scripts
```

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Interactive Documentation

Once the backend is running, access Swagger UI documentation at:

```
http://localhost:3000/api-docs
```

### Health Check

```
GET http://localhost:3000/health
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user (with optional role) | Public |
| POST | `/api/auth/login` | Login and receive JWT tokens | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout and blacklist tokens | Public |

### User Management Endpoints (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (with filters) |
| GET | `/api/users/pending-managers` | Get pending manager approvals |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id/approve-manager` | Approve/reject manager registration |
| PATCH | `/api/users/:id/role` | Update user role |
| PATCH | `/api/users/:id/status` | Activate/deactivate user |

### Product Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products (paginated, filterable) | Admin, Warehouse |
| GET | `/api/products/:id` | Get product by ID | Admin, Warehouse |
| POST | `/api/products` | Create new product | Admin, Warehouse |
| PUT | `/api/products/:id` | Update product | Admin, Warehouse |
| DELETE | `/api/products/:id` | Delete product | Admin, Warehouse |

### Sales Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/sales` | Get all sales (paginated) | Admin, Manager |
| GET | `/api/sales/:id` | Get sale by ID | Admin, Manager |
| POST | `/api/sales` | Create new sale | Admin, Manager |
| PUT | `/api/sales/:id` | Update sale | Admin, Manager |
| DELETE | `/api/sales/:id` | Delete sale (restores stock) | Admin, Manager |

### Staff Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/staff` | Get all staff (paginated) | Admin, Manager |
| GET | `/api/staff/:id` | Get staff by ID | Admin, Manager |
| POST | `/api/staff` | Create new staff (auto-creates user) | Admin, Manager |
| PUT | `/api/staff/:id` | Update staff | Admin, Manager |
| DELETE | `/api/staff/:id` | Delete staff | Admin |

### Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "status": "success",
  "message": "Optional success message",
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message",
  "errors": ["Detailed error messages"]
}
```

## User Roles and Permissions

### Role Hierarchy

1. **ADMIN**: Full system access
2. **MANAGER**: Dashboard, Sales, Staff management (requires approval)
3. **WAREHOUSE**: Product management
4. **USER**: Basic dashboard access (default)

### Permission Matrix

| Feature | ADMIN | MANAGER | WAREHOUSE | USER |
|---------|-------|---------|-----------|------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Products | ✓ | ✗ | ✓ | ✗ |
| Sales | ✓ | ✓ | ✗ | ✗ |
| Staff | ✓ | ✓ | ✗ | ✗ |
| User Management | ✓ | ✗ | ✗ | ✗ |

### Manager Approval Workflow

1. User registers with "Manager" role selected
2. Account is created with `approvalStatus: PENDING`
3. User cannot log in until approved
4. Admin receives notification in User Management page
5. Admin approves or rejects the request
6. Upon approval, user can log in as Manager

## Deployment

### Backend Deployment (Railway/Heroku)

1. Set environment variables in your deployment platform
2. Ensure `MONGODB_URI` points to your MongoDB Atlas cluster
3. Set `NODE_ENV=production`
4. Configure build command: `cd backend && npm install && npm run build`
5. Configure start command: `cd backend && npm start`
6. Set `PORT` environment variable (usually auto-configured)

### Frontend Deployment (Vercel/Netlify)

1. Set build command: `cd frontend && npm install && npm run build`
2. Set output directory: `frontend/dist/frontend`
3. Configure environment variables for production API URL
4. Update `environment.prod.ts` with production API URL

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Configure network access (allow your IP or 0.0.0.0/0 for development)
4. Create database user
5. Get connection string and set as `MONGODB_URI`

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose

### Git Workflow

1. Create feature branches from `main`
2. Commit frequently with descriptive messages
3. Test changes before pushing
4. Create pull requests for review

### Testing

- Test authentication flows
- Verify role-based access control
- Test CRUD operations for all entities
- Validate error handling
- Check responsive design

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection string
- Verify all environment variables are set
- Check if port 3000 is available
- Review logs for specific errors

**Frontend can't connect to backend:**
- Verify backend is running on correct port
- Check CORS configuration in backend
- Verify API URL in frontend environment files
- Check browser console for CORS errors

**Authentication not working:**
- Verify JWT_SECRET is set correctly
- Check token expiration settings
- Clear browser localStorage
- Verify tokens are being sent in headers

**Database connection issues:**
- Verify MongoDB is running (local) or accessible (Atlas)
- Check connection string format
- Verify network access (for Atlas)
- Check database user credentials

### Getting Help

1. Check application logs (backend and browser console)
2. Review environment configuration
3. Verify all dependencies are installed
4. Check API documentation for endpoint details
5. Review error messages for specific guidance

## License

[Specify your license here]

## Contributors

[Add contributors here]

---

**Last Updated**: [Current Date]

For more information or support, please refer to the code documentation or contact the development team.
