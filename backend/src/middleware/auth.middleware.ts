import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.utils';
import { isTokenBlacklisted } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import { User } from '../models/User.model';

/**
 * Extend Express Request type to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user information to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw AppError.unauthorized('Authentication token required');
    }

    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      throw AppError.unauthorized('Token has been revoked');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists and is active
    const user = await User.findById(decoded.id).select('+isActive');
    if (!user) {
      throw AppError.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw AppError.unauthorized('Account is deactivated');
    }

    // Attach user information to request
    req.user = {
      id: decoded.id,
      email: decoded.email || user.email,
      role: decoded.role || user.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(AppError.unauthorized('Invalid or expired token'));
    }
  }
};

/**
 * Optional authentication middleware
 * Verifies token if present, but doesn't require it
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      // Check if token is blacklisted
      const blacklisted = await isTokenBlacklisted(token);
      if (!blacklisted) {
        // Verify token
        const decoded = verifyToken(token);

        // Check if user still exists and is active
        const user = await User.findById(decoded.id).select('+isActive');
        if (user && user.isActive) {
          // Attach user information to request
          req.user = {
            id: decoded.id,
            email: decoded.email || user.email,
            role: decoded.role || user.role,
          };
        }
      }
    }

    next();
  } catch (error) {
    // If optional auth fails, just continue without user
    next();
  }
};
