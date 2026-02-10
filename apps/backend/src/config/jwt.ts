import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET as string,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET as string,
  accessTokenExpiry: "15m" as SignOptions["expiresIn"],
  refreshTokenExpiry: "7d" as SignOptions["expiresIn"],
};

export interface JwtPayload {
  userId: string;
  role: "USER" | "PROVIDER" | "ADMIN";
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, jwtConfig.accessTokenSecret) as JwtPayload;
}