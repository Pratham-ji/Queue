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
function sendOTP(req, res) {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ message: "Phone is required" });
    }
    const otp = (0, otp_service_1.generateOTP)(phone);
    console.log(`OTP for ${phone} : ${otp}`);
    return res.json({
        message: "OTP sent successfully"
    });
}
function verifyOtpController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ message: "Phone & OTP required" });
        }
        const result = (0, otp_service_1.verifyOtp)(phone, otp);
        if (!result.success) {
            return res.status(401).json({ message: result.message });
        }
        // 2. Find or create user
        const user = {
            userId: phone, // using phone as unique id
            role: "USER", // or PROVIDER
            verified: true,
        };
        // 3. Generate JWT
        const accessToken = (0, jwt_utils_1.generateAccessToken)(user);
        // 4. SEND TOKEN 🔥
        return res.json({
            message: "OTP verified successfully",
            accessToken,
        });
    });
}
