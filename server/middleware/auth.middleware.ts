import { NextFunction, Request, Response } from "express";
import User from "../db/models/User.js";
import { AuthUser } from "../modules/investments/services/investment.service.js";
import { AppError } from "../utils/app-error.js";
import { verifyToken } from "../utils/jwt.js";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw AppError.unauthorized("No token provided");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw AppError.unauthorized("User not found");
    }

    // Attach user to request
    req.user = user.toObject();

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof Error) {
      next(AppError.unauthorized(error.message));
    } else {
      next(AppError.unauthorized("Authentication failed"));
    }
  }
};
