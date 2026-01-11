# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "message": "Optional success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error" | "fail",
  "statusCode": 400,
  "message": "Error message"
}
```

## Endpoints

### Authentication (`/api/auth`)

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/refresh` - Refresh access token
- **POST** `/api/auth/logout` - Logout user

### Staff Management (`/api/staff`)
*Requires: Admin, Manager*

- **GET** `/api/staff` - Get all staff (with pagination, search, filters)
- **GET** `/api/staff/search` - Search staff
- **GET** `/api/staff/:id` - Get staff by ID
- **POST** `/api/staff` - Create staff
- **PUT** `/api/staff/:id` - Update staff
- **DELETE** `/api/staff/:id` - Delete staff (Admin only)

### Products (`/api/products`)
*Requires: Admin, Warehouse*

- **GET** `/api/products` - Get all products (with pagination, search, filters)
- **GET** `/api/products/:id` - Get product by ID
- **POST** `/api/products` - Create product
- **PUT** `/api/products/:id` - Update product
- **DELETE** `/api/products/:id` - Delete product
- **GET** `/api/products/low-stock` - Get low stock products
- **GET** `/api/products/dashboard-stats` - Get product dashboard stats

### Sales (`/api/sales`)
*Requires: Admin, Manager*

- **GET** `/api/sales` - Get all sales (with pagination, filters)
- **GET** `/api/sales/:id` - Get sale by ID
- **POST** `/api/sales` - Create sale (auto-reduces stock)
- **PUT** `/api/sales/:id` - Update sale
- **DELETE** `/api/sales/:id` - Delete sale (restores stock)
- **GET** `/api/sales/daily-report` - Get daily sales report
- **GET** `/api/sales/monthly-report` - Get monthly sales report

### Dashboard (`/api/dashboard`)
*Requires: Admin, Manager*

- **GET** `/api/dashboard/stats` - Get dashboard statistics

## Swagger Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error
