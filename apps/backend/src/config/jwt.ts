import type { SignOptions } from "jsonwebtoken";

export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET as string,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET as string,
  accessTokenExpiry: "15m" as SignOptions["expiresIn"],
  refreshTokenExpiry: "7d" as SignOptions["expiresIn"],
};
