import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { UserRole, User } from '../models/user.model';

export const roleGuard = (
  allowedRoles: UserRole[]
): CanActivateFn => {
  return (route, state) => {
    const tokenStorage = inject(TokenStorageService);
    const router = inject(Router);

    const user = tokenStorage.getUser<User>();

    if (!user) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    // User doesn't have required role - redirect to dashboard
    // Store a message in sessionStorage to show why they were redirected
    const roleNames = allowedRoles.map(r => r.toUpperCase()).join(' or ');
    sessionStorage.setItem('accessDenied', `This page requires ${roleNames} role. Your current role is ${user.role.toUpperCase()}.`);
    router.navigate(['/dashboard']);
    return false;
  };
};
