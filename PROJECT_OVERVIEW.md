# Inventory Management System - Project Overview

## Project Overview and Purpose

The Inventory Management System is a full-stack web application designed to streamline inventory tracking, sales management, and staff administration for businesses dealing with cement products. The system provides a comprehensive solution for managing product inventory, tracking sales transactions, monitoring stock levels, and managing staff members with role-based access control.

### Business Objectives

- **Inventory Control**: Real-time tracking of product quantities, stock status, and low-stock alerts
- **Sales Management**: Automated sales processing with stock reduction and revenue tracking
- **Staff Management**: Centralized employee information and role-based access control
- **Analytics**: Dashboard with key performance indicators including revenue, sales counts, and stock metrics
- **Security**: Secure authentication and authorization to protect sensitive business data

### Target Users

- **Administrators**: Full system access for complete control and management
- **Managers**: Access to sales, staff, and dashboard analytics
- **Warehouse Staff**: Product inventory management and stock tracking
- **Regular Users**: Basic access to view dashboard information

## Features List

### Authentication and Authorization

- User registration with email and password validation
- Secure login with JWT token-based authentication
- Access and refresh token mechanism for enhanced security
- Token blacklisting for secure logout
- Role-based access control (RBAC) with four user roles:
  - **ADMIN**: Full system access
  - **MANAGER**: Sales, staff, and dashboard access
  - **WAREHOUSE**: Product inventory management
  - **USER**: Basic dashboard access

### Product Management

- Complete CRUD operations for product inventory
- Automatic stock status calculation (in_stock, low_stock, out_of_stock, discontinued)
- Low stock alerts and monitoring
- Product search and filtering by category, status, and price range
- SKU-based product identification
- Product categorization and supplier tracking
- Pagination for large product catalogs
- Dashboard statistics for product overview

### Sales Management

- Sales transaction recording with automatic stock reduction
- MongoDB transactions to ensure data consistency
- Stock validation before sale completion
- Sales reporting:
  - Daily sales reports
  - Monthly sales reports
  - Revenue calculations
- Sales filtering by date range, staff, product, and payment method
- Support for multiple payment methods (cash, card, transfer, other)
- Automatic stock restoration on sale deletion
- Customer information tracking

### Staff Management

- Staff member CRUD operations
- Employee information management (department, position, contact details)
- Staff search and filtering capabilities
- Integration with user accounts
- Active/inactive status tracking
- Role-based access restrictions (Managers cannot delete staff)

### Dashboard Analytics

- Real-time statistics aggregation:
  - Total stock value and quantity
  - Low stock and out-of-stock item counts
  - Daily and monthly revenue
  - Total sales count
  - Product and category summaries
- Visual representation of key metrics
- Quick access to critical business information

### Security Features

- Password hashing using bcrypt with salt rounds
- JWT token expiration and refresh mechanism
- Input validation and sanitization using Joi
- CORS protection for cross-origin requests
- Rate limiting to prevent abuse
- Security headers via Helmet middleware
- Request logging with Winston
- Environment variable validation

### API Documentation

- Interactive Swagger/OpenAPI documentation
- Complete endpoint documentation
- Request/response schema definitions
- Authentication examples

## Architecture and System Design

### Technology Stack

#### Backend

- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.18+
- **Language**: TypeScript 5.3+ (strict mode)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, express-rate-limit
- **Documentation**: Swagger (swagger-ui-express, swagger-jsdoc)
- **Compression**: compression middleware

#### Frontend

- **Framework**: Angular 17+ (standalone components)
- **Language**: TypeScript (strict mode)
- **HTTP Client**: Angular HttpClient with RxJS
- **Routing**: Angular Router with lazy loading
- **Styling**: SCSS
- **State Management**: Service-based with RxJS Observables

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Frontend                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │ Dashboard │  │ Products │  │  Sales   │  │
│  │  Module  │  │  Module   │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Core Services & Interceptors                 │  │
│  │  - Auth Service  - JWT Interceptor  - Error Handler   │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ (JWT Authentication)
┌──────────────────────┴──────────────────────────────────────┐
│                  Express.js Backend                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │ Products │  │  Sales   │  │  Staff   │    │
│  │ Controller│ │Controller│ │Controller│ │Controller│    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │              │             │          │
│  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐  │
│  │   Auth   │  │ Products │  │  Sales   │  │  Staff   │  │
│  │  Service │  │  Service │  │  Service │  │  Service │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │         Middleware Layer                             │ │
│  │  - Authentication  - Authorization  - Validation     │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Users   │  │ Products │  │  Sales   │  │  Staff   │    │
│  │ Collection│ │Collection│ │Collection│ │Collection│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture

#### Layered Architecture

1. **Routes Layer** (`src/routes/`)
   - Defines API endpoints
   - Applies middleware (authentication, validation, role-based access)
   - Routes requests to appropriate controllers

2. **Controllers Layer** (`src/controllers/`)
   - Handles HTTP requests and responses
   - Validates request data
   - Calls service layer for business logic
   - Returns formatted responses

3. **Services Layer** (`src/services/`)
   - Contains business logic
   - Interacts with database models
   - Handles data transformations
   - Implements transaction management

4. **Models Layer** (`src/models/`)
   - Mongoose schemas and models
   - Data validation at schema level
   - Pre/post save hooks for business rules
   - Index definitions for query optimization

5. **Middleware Layer** (`src/middleware/`)
   - Authentication middleware (JWT verification)
   - Authorization middleware (role-based access)
   - Validation middleware (Joi schema validation)
   - Error handling middleware
   - Request logging middleware

6. **Configuration Layer** (`src/config/`)
   - Database connection management
   - Logger configuration
   - Swagger documentation setup
   - Environment variable validation

### Frontend Architecture

#### Feature-Based Architecture

1. **Core Module** (`src/app/core/`)
   - Shared services (Auth, API clients)
   - Route guards (authentication, role-based)
   - HTTP interceptors (JWT, error handling)
   - Models and interfaces
   - Configuration files

2. **Features Module** (`src/app/features/`)
   - Feature-specific components
   - Self-contained modules
   - Lazy-loaded routes
   - Feature-specific services

3. **Shared Module** (`src/app/shared/`)
   - Reusable components
   - Layout components
   - Common utilities

#### Component Architecture

- **Standalone Components**: All components are standalone (no NgModules)
- **Lazy Loading**: Routes are lazy-loaded for optimal performance
- **Reactive Forms**: Form handling using Angular Reactive Forms
- **RxJS Observables**: Asynchronous operations using RxJS
- **Dependency Injection**: Services injected via Angular DI

### Data Flow

1. **Authentication Flow**:
   - User submits credentials → Frontend sends POST to `/api/auth/login`
   - Backend validates credentials → Returns JWT tokens
   - Frontend stores tokens → Attaches to subsequent requests

2. **API Request Flow**:
   - Component calls service method → Service makes HTTP request
   - JWT interceptor adds Authorization header → Request sent to backend
   - Backend authenticates → Validates role → Processes request
   - Response returned → Service transforms data → Component updates UI

3. **Sales Transaction Flow**:
   - User creates sale → Frontend sends POST to `/api/sales`
   - Backend validates stock → Starts MongoDB transaction
   - Creates sale record → Reduces product quantity → Commits transaction
   - Returns success response → Frontend updates UI

## API Endpoints Summary

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user and receive JWT tokens | Public |
| POST | `/api/auth/refresh` | Refresh access token using refresh token | Public |
| POST | `/api/auth/logout` | Logout user and blacklist tokens | Public |

### Product Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products (paginated, searchable, filterable) | Admin, Warehouse |
| GET | `/api/products/:id` | Get product by ID | Admin, Warehouse |
| POST | `/api/products` | Create new product | Admin, Warehouse |
| PUT | `/api/products/:id` | Update product | Admin, Warehouse |
| DELETE | `/api/products/:id` | Delete product | Admin, Warehouse |
| GET | `/api/products/low-stock` | Get low stock products | Admin, Warehouse |
| GET | `/api/products/dashboard-stats` | Get product statistics for dashboard | Admin, Warehouse |

**Query Parameters for GET /api/products:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term (searches name, SKU, category)
- `category`: Filter by category
- `status`: Filter by status (in_stock, low_stock, out_of_stock, discontinued)
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

### Sales Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/sales` | Get all sales (paginated, filterable) | Admin, Manager |
| GET | `/api/sales/:id` | Get sale by ID | Admin, Manager |
| POST | `/api/sales` | Create new sale (auto-reduces stock) | Admin, Manager |
| PUT | `/api/sales/:id` | Update sale | Admin, Manager |
| DELETE | `/api/sales/:id` | Delete sale (restores stock) | Admin, Manager |
| GET | `/api/sales/daily-report` | Get daily sales report | Admin, Manager |
| GET | `/api/sales/monthly-report` | Get monthly sales report | Admin, Manager |

**Query Parameters for GET /api/sales:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `startDate`: Filter sales from date
- `endDate`: Filter sales to date
- `staffId`: Filter by staff member ID
- `productId`: Filter by product ID
- `paymentMethod`: Filter by payment method (cash, card, transfer, other)

**Query Parameters for GET /api/sales/daily-report:**
- `date`: Specific date (default: today)

**Query Parameters for GET /api/sales/monthly-report:**
- `year`: Year (default: current year)
- `month`: Month 1-12 (default: current month)

### Staff Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/staff` | Get all staff (paginated, searchable, filterable) | Admin, Manager |
| GET | `/api/staff/search` | Search staff with filters | Admin, Manager |
| GET | `/api/staff/:id` | Get staff by ID | Admin, Manager |
| POST | `/api/staff` | Create new staff member | Admin, Manager |
| PUT | `/api/staff/:id` | Update staff member | Admin, Manager |
| DELETE | `/api/staff/:id` | Delete staff member | Admin only |

**Query Parameters for GET /api/staff:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term (searches employee ID, name, department, position)
- `department`: Filter by department
- `position`: Filter by position
- `isActive`: Filter by active status (true/false)

### Dashboard Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/stats` | Get comprehensive dashboard statistics | Admin, Manager |

### System Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/health` | Health check endpoint | Public |
| GET | `/api-docs` | Swagger API documentation | Public |
| GET | `/` | API information | Public |

### Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
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

## Challenges and Solutions

### Challenge 1: JWT Token Configuration and Environment Variables

**Problem**: JWT secret was not properly loaded because environment variables were being accessed before `dotenv.config()` was called, causing token signing failures.

**Solution**: 
- Moved `dotenv.config()` to the very top of `server.ts` before any other imports
- Implemented environment variable validation at application startup
- Added validation for JWT secret strength (minimum 32 characters)
- Created comprehensive environment setup documentation

**Result**: JWT tokens are now properly generated and verified, ensuring secure authentication.

### Challenge 2: Response Format Mismatch Between Backend and Frontend

**Problem**: Backend controllers were returning `data` and `pagination` as separate properties, while the frontend expected them nested under a single `data` object, causing frontend components to fail when accessing `response.data.data`.

**Solution**:
- Updated all controllers (Staff, Products, Sales) to return consistent nested structure
- Standardized response format: `{ status: "success", data: { data: [...], pagination: {...} } }`
- Ensured all API endpoints follow the same response pattern

**Result**: Frontend components now correctly parse API responses and display data properly.

### Challenge 3: Role-Based Access Control and Route Protection

**Problem**: New users registered with default `USER` role were unable to access the dashboard due to restrictive role guards, causing redirect loops and poor user experience.

**Solution**:
- Updated dashboard route to allow all authenticated user roles (ADMIN, MANAGER, USER, WAREHOUSE)
- Enhanced role guard to provide clear access denied messages
- Implemented session storage for access denial notifications
- Updated dashboard component to display helpful messages when users are redirected due to insufficient permissions

**Result**: Users can now access appropriate features based on their roles, with clear feedback when access is denied.

### Challenge 4: Stock Management and Transaction Integrity

**Problem**: Sales transactions needed to automatically reduce product stock while ensuring data consistency, preventing negative stock, and handling concurrent operations safely.

**Solution**:
- Implemented MongoDB transactions for atomic operations
- Added stock validation before sale creation
- Created pre-save hooks in Product model to automatically update stock status
- Implemented stock restoration when sales are deleted
- Added validation to prevent negative stock quantities

**Result**: Stock levels are accurately maintained, and data integrity is preserved even under concurrent operations.

### Challenge 5: Mongoose Schema Index Warnings

**Problem**: Duplicate index warnings were appearing in console logs due to redundant index definitions (both `unique: true` and explicit `index()` calls).

**Solution**:
- Removed explicit `index: true` from schema fields that already had `unique: true`
- Removed redundant explicit `index()` calls for fields with `unique: true`
- Kept necessary indexes for query optimization (department, position, isActive)

**Result**: Clean console output without warnings, while maintaining optimal query performance.

### Challenge 6: Frontend Loading States and Error Handling

**Problem**: Frontend pages were showing "Loading..." indefinitely when API calls failed, with no user feedback or retry mechanisms.

**Solution**:
- Enhanced error handling in all service methods
- Added specific error messages for different scenarios (401, 403, network errors)
- Implemented retry buttons in error states
- Added empty state messages when no data is available
- Improved loading state management with proper error state transitions

**Result**: Users now receive clear feedback about errors and can retry failed operations.

### Challenge 7: CORS Configuration for Frontend-Backend Communication

**Problem**: Frontend running on `localhost:4200` could not communicate with backend on `localhost:3000` due to CORS restrictions.

**Solution**:
- Configured CORS middleware to allow specific origins
- Set up credentials support for cookie-based authentication
- Configured allowed headers and methods
- Added development mode fallback for easier local development

**Result**: Frontend and backend communicate seamlessly with proper CORS handling.

### Challenge 8: Admin User Creation

**Problem**: No default admin user existed in the system, making it difficult to access protected features during initial setup.

**Solution**:
- Created seed script (`seed-admin.ts`) to programmatically create admin users
- Added npm script for easy execution: `npm run seed:admin`
- Implemented logic to update existing admin passwords if user already exists
- Created comprehensive documentation for admin user creation

**Result**: Administrators can easily create admin accounts for initial system access.

## Technical Decisions

### Why TypeScript?

- **Type Safety**: Catches errors at compile time, reducing runtime errors
- **Better IDE Support**: Enhanced autocomplete and refactoring capabilities
- **Maintainability**: Self-documenting code with type annotations
- **Strict Mode**: Enforces best practices and prevents common pitfalls

### Why MongoDB?

- **Flexible Schema**: Easy to evolve data models as requirements change
- **Document-Based**: Natural fit for JavaScript/TypeScript applications
- **Transactions**: Support for ACID transactions when needed
- **Scalability**: Horizontal scaling capabilities for future growth

### Why Angular Standalone Components?

- **Modern Approach**: Aligns with Angular's future direction
- **Tree Shaking**: Better bundle size optimization
- **Lazy Loading**: Improved initial load times
- **Simplified Architecture**: No NgModule complexity

### Why JWT for Authentication?

- **Stateless**: No server-side session storage required
- **Scalable**: Works well in distributed systems
- **Secure**: Token-based authentication with expiration
- **Refresh Tokens**: Enhanced security with short-lived access tokens

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live inventory updates
2. **Advanced Reporting**: More detailed analytics and custom report generation
3. **Email Notifications**: Low stock alerts and sales summaries via email
4. **Barcode Scanning**: Product identification via barcode scanning
5. **Multi-warehouse Support**: Support for multiple warehouse locations
6. **Inventory Forecasting**: Predictive analytics for stock management
7. **Mobile Application**: Native mobile apps for on-the-go access
8. **Audit Logging**: Comprehensive audit trail for all operations
9. **Export Functionality**: Export reports to PDF, Excel, CSV
10. **Advanced Search**: Full-text search with Elasticsearch integration

## Conclusion

The Inventory Management System provides a robust, scalable solution for managing inventory, sales, and staff. With a clean architecture, comprehensive security, and user-friendly interface, it serves as a solid foundation for business operations. The system's modular design allows for easy extension and maintenance, making it suitable for both current needs and future growth.
