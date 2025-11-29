import { NextFunction, Request, Response } from "express";
import { MongoError } from "mongodb";
import { Error as MongooseError } from "mongoose";
import { AppError, ErrorCode } from "./app-error.js";
import { logger } from "./logger.js";
import { ApiResponse } from "./api-response.js";

/**
 * Handles MongoDB duplicate key errors (E11000)
 */
function handleMongoDBDuplicateKeyError(error: MongoError): AppError {
  const regex = /index: (.+) dup key: { (.+): "(.+)" }/;
  const match = regex.exec(error.message);
  const field = match ? match[2] : "field";
  const value = match ? match[3] : "unknown";

  return AppError.conflict(`${field} '${value}' already exists`, {
    field,
    value,
    constraint: "unique",
  });
}

/**
 * Handles Mongoose validation errors
 */
function handleMongooseValidationError(
  error: MongooseError.ValidationError
): AppError {
  const errors = Object.values(error.errors).map((err: any) => ({
    field: err.path,
    message: err.message,
    value: err.value,
    kind: err.kind,
  }));

  return AppError.validationError("Validation failed", { errors });
}

/**
 * Handles Mongoose CastError (invalid ObjectId, etc.)
 */
function handleMongooseCastError(error: MongooseError.CastError): AppError {
  return AppError.badRequest(`Invalid ${error.path}: ${error.value}`, {
    field: error.path,
    value: error.value,
    expectedType: error.kind,
  });
}

/**
 * Handles MongoDB connection errors
 */
function handleMongoDBConnectionError(error: MongoError): AppError {
  logger.fatal("MongoDB connection error", error);
  return AppError.internalServerError("Database connection failed", {
    code: error.code,
  });
}

/**
 * Handles MongoDB general errors
 */
function handleMongoDBError(error: MongoError): AppError {
  // Duplicate key error
  if (error.code === 11000) {
    return handleMongoDBDuplicateKeyError(error);
  }

  // Connection errors
  if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
    return handleMongoDBConnectionError(error);
  }

  // General MongoDB error
  logger.error("MongoDB error", error, { code: error.code });
  return AppError.databaseError("Database operation failed", {
    code: error.code,
  });
}

/**
 * Converts unknown errors to AppError
 */
function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Mongoose Validation Error
  if (error instanceof MongooseError.ValidationError) {
    return handleMongooseValidationError(error);
  }

  // Mongoose CastError
  if (error instanceof MongooseError.CastError) {
    return handleMongooseCastError(error);
  }

  // MongoDB Error
  if (error && typeof error === "object" && "name" in error) {
    const mongoError = error as any;
    if (
      mongoError.name === "MongoError" ||
      mongoError.name === "MongoServerError"
    ) {
      return handleMongoDBError(mongoError);
    }
  }

  // Standard Error
  if (error instanceof Error) {
    return new AppError(
      error.message || "An unexpected error occurred",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      false
    );
  }

  // Unknown error type
  return new AppError(
    "An unexpected error occurred",
    500,
    ErrorCode.INTERNAL_SERVER_ERROR,
    false
  );
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _: NextFunction
): void {
  const appError = normalizeError(error);

  // Log error
  const logContext = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    statusCode: appError.statusCode,
    code: appError.code,
  };

  if (appError.isOperational) {
    logger.warn("Operational error occurred", logContext);
  } else {
    logger.error("Non-operational error occurred", appError, logContext);
  }

  return ApiResponse.error(res, appError)
}

/**
 * Middleware to handle 404 errors
 */
export function notFoundHandler(
  req: Request,
  _: Response,
  next: NextFunction
): void {
  const error = AppError.notFound(`Route ${req.method} ${req.path} not found`);
  next(error);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
