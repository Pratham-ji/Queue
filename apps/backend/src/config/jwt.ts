import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export const jwtConfig = {
  get accessTokenSecret() { 
    if (!process.env.JWT_ACCESS_SECRET) console.warn("⚠️ JWT_ACCESS_SECRET is missing from .env! Using fallback.");
    return process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "fallback_access_secret_queue_2026"; 
  },
  get refreshTokenSecret() { 
    if (!process.env.JWT_REFRESH_SECRET) console.warn("⚠️ JWT_REFRESH_SECRET is missing from .env! Using fallback.");
    return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "fallback_refresh_secret_queue_2026"; 
  },
  accessTokenExpiry: "15m" as SignOptions["expiresIn"],
  refreshTokenExpiry: "7d" as SignOptions["expiresIn"],
};

export interface JwtPayload {
  userId: string;
  role: "PATIENT" | "PROVIDER" | "ADMIN" | "STAFF";
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, jwtConfig.accessTokenSecret) as JwtPayload;
}