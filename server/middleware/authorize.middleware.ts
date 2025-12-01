import { NextFunction, Request, Response } from 'express';
import { UserRole } from '@shared/types';
import { AppError } from '../utils/app-error.js';

/**
 * Authorization middleware factory that checks if user has required role(s)
 * Must be used after authenticate middleware
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required before authorization'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden(`Access denied. Required role: ${allowedRoles.join(' or ')}`));
    }

    next();
  };
};

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = authorize('admin');

/**
 * Middleware to allow both admin and viewer roles
 */
export const requireAuthenticated = authorize('admin', 'viewer');
