"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.jwtConfig = {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: "15m",
    refreshTokenExpiry: "7d",
};
const JWT_SECRET = process.env.JWT_SECRET;
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
