import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export interface JwtPayload {
  userId: string;
}

export interface DecodedToken extends JwtPayload {
  iat: number;
  exp: number;
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const verifyToken = (token: string): DecodedToken => {
  try {
    return jwt.verify(token, config.jwtSecret) as DecodedToken;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
};
