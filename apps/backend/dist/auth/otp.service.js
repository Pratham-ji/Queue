"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.verifyOtp = verifyOtp;
const crypto_1 = __importDefault(require("crypto"));
// Temporary in-memory store
// Replace with Redis later
const otpStore = new Map();
/*
Structure:
otpStore.set(phone, {
  hash,
  expiresAt,
  attempts
})
*/
const otp_expire = 5 * 60 * 1000; // this is 5 min of time
const max_attempt = 5; // only 5 attempts are allowed 
function generateOTP(phone) {
    // create otp 
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    //hash otp (into cipher code)
    const hash = crypto_1.default.createHash("sha256").update(otp).digest("hex");
    // store OTP securely
    otpStore.set(phone, { hash, expiresAt: Date.now() + otp_expire, attempts: 0 });
    return otp;
}
function verifyOtp(phone, otp) {
    const record = otpStore.get(phone);
    if (!record) {
        return { success: false, message: "OTP not found" };
    }
    //here otp expire
    if (Date.now() > record.expiresAt) {
        otpStore.delete(phone);
        return { success: false, message: "OTP expired" };
    }
    //attempts count
    if (record.attempts >= max_attempt) {
        otpStore.delete(phone);
        return { success: false, message: "Too many attempts" };
    }
    const incomingHash = crypto_1.default.createHash("sha256").update(otp).digest("hex");
    //wrong otp
    if (incomingHash != record.hash) {
        record.attempts += 1;
        otpStore.set(phone, record);
        return {
            success: false,
            message: `Invalid OTP. Attempts Left:${max_attempt - record.attempts}`
        };
    }
    //found correct otp
    otpStore.delete(phone);
    return { success: true };
}
