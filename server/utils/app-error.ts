export enum ErrorCode {
  // General errors (1000-1999)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Authentication & Authorization errors (2000-2999)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Resource errors (3000-3999)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Database errors (4000-4999)
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',

  // Business logic errors (5000-5999)
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
}

export interface ErrorDetails {
  field?: string;
  value?: any;
  constraint?: string;
  [key: string]: any;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: ErrorDetails;
  public readonly timestamp: Date;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: ErrorDetails
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }

  // Factory methods for common errors
  static badRequest(message: string, details?: ErrorDetails): AppError {
    return new AppError(message, 400, ErrorCode.BAD_REQUEST, true, details);
  }

  static unauthorized(message: string = 'Unauthorized', details?: ErrorDetails): AppError {
    return new AppError(message, 401, ErrorCode.UNAUTHORIZED, true, details);
  }

  static forbidden(message: string = 'Forbidden', details?: ErrorDetails): AppError {
    return new AppError(message, 403, ErrorCode.FORBIDDEN, true, details);
  }

  static notFound(message: string = 'Resource not found', details?: ErrorDetails): AppError {
    return new AppError(message, 404, ErrorCode.RESOURCE_NOT_FOUND, true, details);
  }

  static conflict(message: string, details?: ErrorDetails): AppError {
    return new AppError(message, 409, ErrorCode.DUPLICATE_ENTRY, true, details);
  }

  static validationError(message: string, details?: ErrorDetails): AppError {
    return new AppError(message, 422, ErrorCode.VALIDATION_ERROR, true, details);
  }

  static internalServerError(message: string = 'Internal server error', details?: ErrorDetails): AppError {
    return new AppError(message, 500, ErrorCode.INTERNAL_SERVER_ERROR, false, details);
  }

  static databaseError(message: string, details?: ErrorDetails): AppError {
    return new AppError(message, 500, ErrorCode.DATABASE_ERROR, false, details);
  }
}
