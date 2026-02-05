"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_utils_1 = require("./utils/jwt.utils");
const token = (0, jwt_utils_1.generateAccessToken)({
    userId: "test123",
    role: "USER",
    verified: true,
});
console.log("JWT TOKEN:", token);
