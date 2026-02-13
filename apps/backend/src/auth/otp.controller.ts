import { generateOTP, verifyOtp } from "./otp.service"
import { Request, Response } from "express";
import { generateAccessToken } from "../utils/jwt.utils"

export function sendOTP(req: Request, res: Response) {
    const { phone, role } = req.body;  // Accept role

    if (!phone || !role) {
        return res.status(400).json({ message: "Phone & role required" });
    }

    const otp = generateOTP(phone);
    console.log(`OTP for ${phone} : ${otp}`);
    
    return res.json({
        message: "OTP sent successfully",
        role  // Return back so user knows
    })
}
export async function verifyOtpController(req: Request, res: Response) {
    const { phone, otp, role } = req.body;  // Accept role here

    if (!phone || !otp || !role) {
        return res.status(400).json({ message: "Phone, OTP & role required" });
    }

    const result = verifyOtp(phone, otp)

    if (!result.success) {
        return res.status(401).json({ message: result.message })
    }

    const user = {
        userId: phone,
        role: role,  // Use provided role instead of hardcoded
        verified: true,
    };

    const accessToken = generateAccessToken(user);

    return res.json({
        message: "OTP verified successfully",
        accessToken,
    });
}