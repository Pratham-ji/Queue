"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.jwtConfig = {
    get accessTokenSecret() {
        if (!process.env.JWT_ACCESS_SECRET)
            console.warn("⚠️ JWT_ACCESS_SECRET is missing from .env! Using fallback.");
        return process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "fallback_access_secret_queue_2026";
    },
    get refreshTokenSecret() {
        if (!process.env.JWT_REFRESH_SECRET)
            console.warn("⚠️ JWT_REFRESH_SECRET is missing from .env! Using fallback.");
        return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "fallback_refresh_secret_queue_2026";
    },
    accessTokenExpiry: "15m",
    refreshTokenExpiry: "7d",
};
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, exports.jwtConfig.accessTokenSecret);
}
