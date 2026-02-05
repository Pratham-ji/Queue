import {loginAfterOtp} from "./auth.service"
import { Request, Response } from "express";

interface AuthenticatedUser {
  id: string;
  role: "admin" | "user";
  verified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser; // ✅ Specific type instead of any
    }
  }
}

export const verifyOtp = async (req : Request, res : Response) => {
  const user = req.user; // after OTP verified

  const tokens = await loginAfterOtp(user);

  return res.status(200).json({
    message: "Login successful",
    ...tokens,
  });
};