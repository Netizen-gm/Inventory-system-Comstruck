import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { UserRole } from '../models/User.model';
import { HTTP_STATUS } from '../utils/constants';

/**
 * Role-based access control middleware
 * Checks if the authenticated user has the required role(s)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw AppError.forbidden('Insufficient permissions');
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = authorize(UserRole.ADMIN);

/**
 * Manager-only middleware
 */
export const requireManager = authorize(UserRole.MANAGER);

/**
 * Admin or Manager middleware
 */
export const requireAdminOrManager = authorize(UserRole.ADMIN, UserRole.MANAGER);

/**
 * Warehouse-only middleware
 */
export const requireWarehouse = authorize(UserRole.WAREHOUSE);

/**
 * Admin or Warehouse middleware
 */
export const requireAdminOrWarehouse = authorize(UserRole.ADMIN, UserRole.WAREHOUSE);

/**
 * User or Admin middleware
 */
export const requireUserOrAdmin = authorize(UserRole.USER, UserRole.ADMIN);
