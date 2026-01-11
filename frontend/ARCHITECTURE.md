# Angular Application Architecture

## Overview

This is a production-ready Angular 17+ application built following clean architecture principles with standalone components, strict TypeScript, and secure JWT handling.

## Architecture Principles

### 1. Standalone Components
- All components are standalone (no NgModules)
- Lazy loading with route-based code splitting
- Tree-shakeable imports

### 2. Clean Architecture Layers

#### Core Layer (`src/app/core/`)
Contains shared, application-wide functionality:
- **Models**: TypeScript interfaces matching backend API contracts
- **Services**: Business logic and API communication
- **Guards**: Route protection (authentication, role-based)
- **Interceptors**: HTTP request/response manipulation (JWT, error handling)
- **Config**: Application configuration (API endpoints, constants)

#### Features Layer (`src/app/features/`)
Feature modules organized by domain:
- **auth**: Authentication (login, register)
- **dashboard**: Dashboard with statistics
- **products**: Product inventory management
- **sales**: Sales management
- **staff**: Staff management

#### Shared Layer (`src/app/shared/`)
Reusable components and utilities:
- **layout**: Main application layout with navigation

## Security

### JWT Authentication Flow

1. **Login/Register**: User credentials sent to backend
2. **Token Storage**: Access and refresh tokens stored in localStorage
3. **Request Interceptor**: Automatically attaches access token to HTTP requests
4. **Error Interceptor**: Handles 401 errors, clears tokens, redirects to login
5. **Route Guards**: Protect routes based on authentication and roles

### Token Management

- **Access Token**: Short-lived, included in Authorization header
- **Refresh Token**: Long-lived, used to obtain new access tokens
- **Storage**: Secure localStorage storage (consider httpOnly cookies for production)
- **Auto-logout**: On 401 errors, tokens cleared and user redirected

### Role-Based Access Control (RBAC)

Routes are protected based on user roles:
- **ADMIN**: Full access
- **MANAGER**: Dashboard, Sales, Staff
- **WAREHOUSE**: Products
- **USER**: Basic access (default)

## HTTP Client Architecture

### Interceptors

1. **JWT Interceptor** (`jwt.interceptor.ts`)
   - Attaches Bearer token to authorized requests
   - Runs before every HTTP request

2. **Error Interceptor** (`error.interceptor.ts`)
   - Handles HTTP errors globally
   - 401 errors trigger logout and redirect
   - Runs after every HTTP response

### API Service Pattern

Each feature has a dedicated service:
- **AuthService**: Authentication operations
- **ProductsService**: Product CRUD operations
- **SalesService**: Sales operations and reports
- **StaffService**: Staff management
- **DashboardService**: Dashboard statistics

All services:
- Use typed interfaces matching backend responses
- Handle errors consistently
- Return RxJS Observables
- Follow RESTful conventions

## State Management

Currently using:
- **Component State**: Local component state for UI
- **Service State**: Services cache data where appropriate
- **Token Storage**: Centralized token/user storage service

For complex state management, consider:
- NgRx (for complex state)
- Akita (lightweight alternative)
- Service-based state (current approach)

## Routing Strategy

### Route Structure

```
/auth
  /login
  /register
/
  /dashboard (Admin, Manager)
  /products (Admin, Warehouse)
  /sales (Admin, Manager)
  /staff (Admin, Manager)
```

### Route Protection

- **authGuard**: Ensures user is authenticated
- **roleGuard**: Factory function that creates guard for specific roles
- Lazy loading for all feature routes

## Type Safety

### Strict TypeScript
- `strict: true` in tsconfig.json
- No implicit any
- Strict null checks
- Strict function types

### Model Matching
- All models match backend interfaces exactly
- Shared types between frontend and backend
- Type-safe API responses

## Styling

- **SCSS**: Component-scoped styles
- **Global Styles**: Minimal global styles in `styles.scss`
- **Design System**: Consistent color palette and spacing
- **Responsive**: Mobile-first responsive design
- **Modern UI**: Clean, modern interface with gradients and shadows

## Performance

### Optimization Strategies

1. **Lazy Loading**: All feature routes are lazy loaded
2. **OnPush Change Detection**: Can be added for performance
3. **TrackBy Functions**: Used in *ngFor loops
4. **Tree Shaking**: Standalone components enable better tree shaking
5. **Code Splitting**: Automatic code splitting by route

### Bundle Analysis

Build output shows:
- Separate chunks for each feature
- Main bundle optimized
- CSS warnings for large stylesheets (non-critical)

## Testing Strategy

### Unit Tests
- Component tests (to be implemented)
- Service tests (to be implemented)
- Guard tests (to be implemented)

### Integration Tests
- E2E tests (to be implemented)
- API integration tests (to be implemented)

## Development Workflow

### Code Organization
- Feature-based folder structure
- Clear separation of concerns
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)

### Naming Conventions
- **Components**: PascalCase (e.g., `LoginComponent`)
- **Services**: PascalCase with Service suffix (e.g., `AuthService`)
- **Models**: PascalCase (e.g., `User`, `Product`)
- **Files**: kebab-case (e.g., `login.component.ts`)

## Production Readiness

### Checklist
- Standalone components
- Strict TypeScript
- Secure JWT handling
- Error handling
- Route guards
- Role-based access control
- Responsive design
- Production build
- Unit tests (to be added)
- E2E tests (to be added)
- Environment configuration (to be added)

## Future Enhancements

1. **State Management**: Consider NgRx for complex state
2. **Testing**: Add comprehensive test coverage
3. **Environment Config**: Separate dev/prod configurations
4. **Error Tracking**: Integrate error tracking service (Sentry)
5. **Analytics**: Add analytics tracking
6. **PWA**: Convert to Progressive Web App
7. **Internationalization**: Add i18n support
8. **Accessibility**: Enhance a11y features

## Best Practices Followed

1. Standalone components (no NgModules)
2. Strict TypeScript
3. Reactive forms with validation
4. RxJS for async operations
5. Secure token storage
6. HTTP interceptors for cross-cutting concerns
7. Route guards for authorization
8. Clean architecture separation
9. Consistent error handling
10. Type-safe API contracts
