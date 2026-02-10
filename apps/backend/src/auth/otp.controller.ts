import { generateOTP, verifyOtp } from "./otp.service"
import { Request, Response } from "express";
import { generateAccessToken } from "../utils/jwt.utils"

export function sendOTP(req: Request, res: Response) {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: "Phone is required" });
    }

    const otp = generateOTP(phone);

    console.log(`OTP for ${phone} : ${otp}`);
    return res.json({
        message: "OTP sent successfully"
    })
}

export async function verifyOtpController(req: Request, res: Response) {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ message: "Phone & OTP required" });
    }

    const result = verifyOtp(phone, otp)

    if (!result.success) {
        return res.status(401).json({ message: result.message })
    }

    // 2. Find or create user
    const user = {
    userId: phone,       // using phone as unique id
    role: "USER",        // or PROVIDER
    verified: true,
  };

    // 3. Generate JWT
    const accessToken = generateAccessToken(user);

    // 4. SEND TOKEN 🔥
    return res.json({
        message: "OTP verified successfully",
        accessToken,
    });
}