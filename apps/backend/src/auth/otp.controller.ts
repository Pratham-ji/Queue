import { generateOTP, verifyOtp } from "./otp.service"
import { Request, Response } from "express";
import { generateAccessToken } from "../utils/jwt.utils"
import { prisma } from "../utils/prisma";

export function sendOTP(req: Request, res: Response) {
    const { phone, role } = req.body;  // Accept role

    if (!phone || !role) {
        return res.status(400).json({ success: false, message: "Phone & role required" });
    }

    const otp = generateOTP(phone);

    // DEV ONLY: Log OTP for testing — NEVER in production
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }
    
    return res.json({
        success: true,
        message: "OTP sent successfully",
        role  // Return back so user knows
    })
}

export async function verifyOtpController(req: Request, res: Response) {
    const { phone, otp, role } = req.body;  // Accept role here

    // Temporarily allow OTP bypass for "123456" in dev
    const isTestOTP = process.env.NODE_ENV !== "production" && otp === "123456";

    if (!phone || !otp) {
        return res.status(400).json({ success: false, message: "Phone & OTP required" });
    }

    if (!isTestOTP) {
      const result = verifyOtp(phone, otp)
      if (!result.success) {
          return res.status(401).json({ success: false, error: result.message })
      }
    }

    try {
      // Find user by phone
      let user = await prisma.user.findFirst({
        where: { phone }
      });

      // If user doesn't exist, create a stub user for PATIENT (since OTP login implies mobile app)
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: "Patient",
            email: `${phone}@queue.app`, // Dummy email since it's required
            password: "OTP_LOGIN", // Placeholder
            phone: phone,
            role: "PATIENT",
          }
        });
      }

      const tokenPayload = {
          userId: user.id,
          role: user.role,
          verified: true,
      };

      const accessToken = generateAccessToken(tokenPayload);

      return res.json({
          success: true,
          message: "OTP verified successfully",
          data: {
            accessToken,
            user,
          }
      });
    } catch (err) {
      console.error("OTP Verify Error:", err);
      return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}