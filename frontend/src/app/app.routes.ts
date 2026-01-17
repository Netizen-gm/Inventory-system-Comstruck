import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.WAREHOUSE])],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'products',
        canActivate: [roleGuard([UserRole.ADMIN, UserRole.WAREHOUSE])],
        loadComponent: () =>
          import('./features/products/products-list/products-list.component').then(
            (m) => m.ProductsListComponent
          ),
      },
      {
        path: 'sales',
        canActivate: [roleGuard([UserRole.ADMIN, UserRole.MANAGER])],
        loadComponent: () =>
          import('./features/sales/sales-list/sales-list.component').then(
            (m) => m.SalesListComponent
          ),
      },
      {
        path: 'staff',
        canActivate: [roleGuard([UserRole.ADMIN, UserRole.MANAGER])],
        loadComponent: () =>
          import('./features/staff/staff-list/staff-list.component').then(
            (m) => m.StaffListComponent
          ),
      },
      {
        path: 'users',
        canActivate: [roleGuard([UserRole.ADMIN])],
        loadComponent: () =>
          import('./features/users/user-management/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
