import * as jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";

interface JwtPayLoad {
  userId: string;
  role: string;
  hospitalID? : string | null;
  verified: boolean;
}

export const generateAccessToken = (payload: JwtPayLoad): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.accessTokenExpiry,
  };

  return jwt.sign(
    payload,
    jwtConfig.accessTokenSecret,
    options
  );
};

export const generateRefreshToken = (
  payload: Pick<JwtPayLoad, "userId">
): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.refreshTokenExpiry,
  };

  return jwt.sign(
    payload,
    jwtConfig.refreshTokenSecret,
    options
  );
};


export const verifyAccessToken = (token: string): JwtPayLoad => {
  return jwt.verify(
    token,
    jwtConfig.accessTokenSecret
  ) as JwtPayLoad;
};
