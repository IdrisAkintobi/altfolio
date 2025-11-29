import { Response } from "express";
import { AppError } from "./app-error";
import { config } from "../config/env";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
    errors?: any[];
  };
}

export class ApiResponse {
  /**
   * Send a successful response
   */
  static success<T>(res: Response, data?: T, message?: string): void {
    res.status(200).json({
      status: "success",
      ...(message && { message }),
      ...(data !== undefined && { data }),
    });
  }

  /**
   * Send a created response (201)
   */
  static created<T>(res: Response, data?: T, message?: string): void {
    res.status(201).json({
      status: "success",
      ...(message && { message }),
      ...(data !== undefined && { data }),
    });
  }

  /**
   * Send a paginated response
   */
  static paginated<T>(
    res: Response,
    data: PaginatedResponse<T>,
    message?: string
  ): void {
    res.status(200).json({
      status: "success",
      ...(message && { message }),
      data: data.items,
      pagination: data.pagination,
    });
  }

  /**
   * Send error response
   */
  static error<T>(res: Response, appError: AppError): void {
  // Send error response using standard format
  const errors = appError.details?.errors;
  const details = errors ? undefined : appError.details;

  // Build error object
  const errorObj: any = {
    code: appError.code,
    ...(errors && { errors }),
    ...(details && { details }),
  };

  // Add stack trace in development
  if (config.isDev && appError.stack) {
    errorObj.stack = appError.stack;
  }

  res.status(appError.statusCode).json({
    status: "error",
    message: appError.message,
    error: errorObj,
  });
  }
}
