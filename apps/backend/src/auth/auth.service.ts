// src/modules/auth/auth.service.ts
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.utils";

export const loginAfterOtp = async (user: any) => {
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    verified: true,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  return {
    accessToken,
    refreshToken,
  };
};
