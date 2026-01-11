import * as jwt from 'jsonwebtoken';
import { JWT_CONFIG } from './constants';
import { AppError } from './AppError';

export interface JWTPayload {
  id: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface TokenOptions {
  expiresIn?: string;
  issuer?: string;
  subject?: string;
}

/**
 * Sign a JWT token with the payload
 * @param payload - Data to encode in the token
 * @param options - Additional token options (expiresIn, issuer, subject)
 * @returns Signed JWT token string
 */
export const signToken = (
  payload: JWTPayload,
  options?: TokenOptions
): string => {
  try {
    const jwtSecret = JWT_CONFIG.SECRET;

    if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-key') {
      throw new Error('JWT_SECRET is not properly configured');
    }

    const tokenOptions: jwt.SignOptions = {
      expiresIn: options?.expiresIn || JWT_CONFIG.EXPIRES_IN,
      algorithm: JWT_CONFIG.ALGORITHM,
    };

    if (options?.issuer) {
      tokenOptions.issuer = options.issuer;
    }

    if (options?.subject) {
      tokenOptions.subject = options.subject;
    }

    return jwt.sign(payload, jwtSecret, tokenOptions);
  } catch (error) {
    if (error instanceof Error) {
      throw AppError.internal(`Token signing failed: ${error.message}`);
    }
    throw AppError.internal('Token signing failed');
  }
};

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded token payload
 * @throws AppError if token is invalid or expired
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const jwtSecret = JWT_CONFIG.SECRET;

    if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-key') {
      throw new Error('JWT_SECRET is not properly configured');
    }

    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: [JWT_CONFIG.ALGORITHM],
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    // Handle JWT-specific errors by name
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Token has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw AppError.unauthorized('Invalid token');
      }

      if (error.name === 'NotBeforeError') {
        throw AppError.unauthorized('Token not active');
      }

      throw AppError.unauthorized(`Token verification failed: ${error.message}`);
    }

    throw AppError.unauthorized('Token verification failed');
  }
};

/**
 * Decode a JWT token without verification (for inspection purposes only)
 * @param token - JWT token string to decode
 * @returns Decoded token payload with standard claims (not verified)
 */
export const decodeToken = (token: string): (JWTPayload & { exp?: number; iat?: number }) | null => {
  try {
    return jwt.decode(token, { complete: false }) as (JWTPayload & { exp?: number; iat?: number }) | null;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns Token string or null if not found
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};
