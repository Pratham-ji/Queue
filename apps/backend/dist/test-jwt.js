"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // 👈 THIS LINE IS CRITICAL
const jwt_utils_1 = require("./utils/jwt.utils");
const token = (0, jwt_utils_1.generateAccessToken)({
    userId: "test123",
    role: "USER",
    verified: true,
});
const refreshToken = (0, jwt_utils_1.generateRefreshToken)({
    userId: "test123",
});
console.log("JWT ACCESS TOKEN:", token);
console.log("JWT REFRESH TOKEN:", refreshToken);
