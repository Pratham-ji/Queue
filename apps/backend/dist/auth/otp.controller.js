"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = sendOTP;
exports.verifyOtpController = verifyOtpController;
const otp_service_1 = require("./otp.service");
const jwt_utils_1 = require("../utils/jwt.utils");
const prisma_1 = require("../utils/prisma");
function sendOTP(req, res) {
    const { phone, role } = req.body; // Accept role
    if (!phone || !role) {
        return res.status(400).json({ success: false, message: "Phone & role required" });
    }
    const otp = (0, otp_service_1.generateOTP)(phone);
    // DEV ONLY: Log OTP for testing — NEVER in production
    if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }
    return res.json({
        success: true,
        message: "OTP sent successfully",
        role // Return back so user knows
    });
}
function verifyOtpController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { phone, otp, role } = req.body; // Accept role here
        // Temporarily allow OTP bypass for "123456" in dev
        const isTestOTP = process.env.NODE_ENV !== "production" && otp === "123456";
        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: "Phone & OTP required" });
        }
        if (!isTestOTP) {
            const result = (0, otp_service_1.verifyOtp)(phone, otp);
            if (!result.success) {
                return res.status(401).json({ success: false, error: result.message });
            }
        }
        try {
            // Find user by phone
            let user = yield prisma_1.prisma.user.findFirst({
                where: { phone }
            });
            // If user doesn't exist, create a stub user for PATIENT (since OTP login implies mobile app)
            if (!user) {
                user = yield prisma_1.prisma.user.create({
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
            const accessToken = (0, jwt_utils_1.generateAccessToken)(tokenPayload);
            return res.json({
                success: true,
                message: "OTP verified successfully",
                data: {
                    accessToken,
                    user,
                }
            });
        }
        catch (err) {
            console.error("OTP Verify Error:", err);
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    });
}
