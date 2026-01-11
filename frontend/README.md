# Angular Frontend Application

A production-ready Angular 17+ application built with standalone components, strict TypeScript, and clean architecture.

## Features

- **Angular 17+** with standalone components (no NgModules)
- **Strict TypeScript** configuration
- **Secure JWT handling** with interceptors and token storage
- **Role-based access control** (RBAC) with route guards
- **Clean architecture** with feature-based organization
- **Production-ready UI** with modern, responsive design
- **Full integration** with backend API

## Project Structure

```
src/app/
├── core/                    # Core functionality
│   ├── config/             # Configuration files
│   ├── guards/             # Route guards (auth, role-based)
│   ├── interceptors/       # HTTP interceptors (JWT, error handling)
│   ├── models/             # TypeScript interfaces/models
│   └── services/           # Core services (auth, API clients)
├── features/               # Feature modules
│   ├── auth/               # Authentication (login, register)
│   ├── dashboard/          # Dashboard with statistics
│   ├── products/           # Product management
│   ├── sales/              # Sales management
│   └── staff/              # Staff management
└── shared/                 # Shared components
    └── layout/             # Main layout component
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The application will be available at `http://localhost:4200`.

## Configuration

Update the API base URL in `src/app/core/config/api.config.ts` if your backend runs on a different port or domain.

## Authentication

The application uses JWT-based authentication:
- Access tokens are stored in localStorage
- Tokens are automatically attached to HTTP requests via interceptor
- Unauthorized requests (401) automatically redirect to login
- Role-based route protection ensures users can only access authorized pages

## User Roles

- **ADMIN**: Full access to all features
- **MANAGER**: Access to dashboard, sales, and staff management
- **WAREHOUSE**: Access to products management
- **USER**: Basic user (default role)

## Development

### Code Style

- Strict TypeScript enabled
- Standalone components only (no NgModules)
- Reactive forms for form handling
- RxJS for asynchronous operations
- SCSS for styling

### Key Technologies

- Angular 17+
- RxJS
- TypeScript (strict mode)
- SCSS

## Production Build

```bash
npm run build
```

The production build will be in the `dist/` directory.

## License

ISC
