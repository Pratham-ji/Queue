"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = sendOTP;
exports.verifyOtpController = verifyOtpController;
const otp_service_1 = require("./otp.service");
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
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ message: "Phone & OTP required" });
    }
    const result = (0, otp_service_1.verifyOtp)(phone, otp);
    if (!result.success) {
        return res.status(401).json({ message: result.message });
    }
    return res.json({ message: "OTP verified successfully" });
}
