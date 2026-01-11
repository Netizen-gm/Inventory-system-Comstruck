import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';
import logger from '../config/logger';
import mongoose from 'mongoose';

export interface ErrorResponse {
  status: string;
  statusCode: number;
  message: string;
  stack?: string;
  errors?: unknown[];
}

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (error: mongoose.Error.ValidationError): AppError => {
  const errors = Object.values(error.errors).map((err) => err.message);
  const message = `Validation Error: ${errors.join(', ')}`;
  return AppError.badRequest(message);
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateKeyError = (error: { code?: number; keyValue?: Record<string, unknown> }): AppError => {
  const field = Object.keys(error.keyValue || {})[0];
  const value = error.keyValue?.[field];
  const message = `${field} with value ${value} already exists`;
  return AppError.conflict(message);
};

/**
 * Handle Mongoose cast errors (invalid ObjectId, etc.)
 */
const handleCastError = (error: mongoose.Error.CastError): AppError => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return AppError.badRequest(message);
};

/**
 * Handle JWT errors
 */
const handleJWTError = (): AppError => {
  return AppError.unauthorized('Invalid token. Please log in again.');
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = (): AppError => {
  return AppError.unauthorized('Your token has expired. Please log in again.');
};

/**
 * Send error response in development mode (with stack trace)
 */
const sendErrorDev = (err: AppError | Error, res: Response): void => {
  const statusCode = err instanceof AppError ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const status = err instanceof AppError ? err.status : 'error';

  const errorResponse: ErrorResponse = {
    status,
    statusCode,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Send error response in production mode (without sensitive information)
 */
const sendErrorProd = (err: AppError | Error, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong!',
    });
  }
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: AppError | Error = err;

  // Handle specific error types
  if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationError(err);
  } else if ((err as { code?: number }).code === 11000) {
    error = handleDuplicateKeyError(err as { code: number; keyValue?: Record<string, unknown> });
  } else if (err instanceof mongoose.Error.CastError) {
    error = handleCastError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  const statusCode = error instanceof AppError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Log error
  logger.error(`Error ${statusCode}: ${error.message}`, {
    error: error,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: error.stack,
  });

  // Send error response based on environment
  if (process.env.NODE_ENV === 'production') {
    sendErrorProd(error, res);
  } else {
    sendErrorDev(error, res);
  }
};

/**
 * Handle 404 Not Found errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = AppError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};
