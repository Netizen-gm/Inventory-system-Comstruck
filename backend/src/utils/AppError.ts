import { HTTP_STATUS } from './constants';

/**
 * Custom Application Error Class
 * Extends the built-in Error class with status code and isOperational flag
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly status: string;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a Bad Request error (400)
   */
  static badRequest(message: string): AppError {
    return new AppError(message, HTTP_STATUS.BAD_REQUEST);
  }

  /**
   * Create an Unauthorized error (401)
   */
  static unauthorized(message: string = 'Unauthorized access'): AppError {
    return new AppError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * Create a Forbidden error (403)
   */
  static forbidden(message: string = 'Forbidden access'): AppError {
    return new AppError(message, HTTP_STATUS.FORBIDDEN);
  }

  /**
   * Create a Not Found error (404)
   */
  static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(message, HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Create a Conflict error (409)
   */
  static conflict(message: string): AppError {
    return new AppError(message, HTTP_STATUS.CONFLICT);
  }

  /**
   * Create an Unprocessable Entity error (422)
   */
  static unprocessableEntity(message: string = 'Validation error'): AppError {
    return new AppError(message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }

  /**
   * Create an Internal Server Error (500)
   */
  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
  }
}
