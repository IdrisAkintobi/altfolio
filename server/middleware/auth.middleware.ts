import { NextFunction, Request, Response } from 'express';
import UserModel from '../db/models/User.js';
import { type User } from '@shared/types';
import { AppError } from '../utils/app-error.js';
import { verifyToken } from '../utils/jwt.js';

// Extend Express Request type to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = await verifyToken(token);

    // Fetch user from database
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      throw AppError.unauthorized('User not found');
    }

    // Attach user to request (toObject uses transformDoc to convert _id to id)
    req.user = user.toObject() as unknown as User;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof Error) {
      next(AppError.unauthorized(error.message));
    } else {
      next(AppError.unauthorized('Authentication failed'));
    }
  }
};
