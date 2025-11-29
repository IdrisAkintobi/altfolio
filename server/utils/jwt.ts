import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { config } from "../config/env.js";

const secret = new TextEncoder().encode(config.jwtSecret);

export const generateToken = async (userId: string): Promise<string> => {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.jwtExpiresIn)
    .sign(secret);
};

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.userId || typeof payload.userId !== 'string') {
      throw new Error("Invalid token payload");
    }
    
    return {
      userId: payload.userId,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        throw new Error("Token has expired");
      }
      throw new Error("Invalid token");
    }
    throw error;
  }
};
