"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const jwt_utils_1 = require("../utils/jwt.utils");
const router = (0, express_1.Router)();
// 🔓 Generate test token (for testing only)
router.get("/generate-token", (req, res) => {
    const testUser = {
        userId: "test-user-123",
        role: "USER",
        verified: true,
    };
    const token = (0, jwt_utils_1.generateAccessToken)(testUser);
    res.json({
        message: "Test token generated",
        token,
        instructions: "Use this token: Authorization: Bearer " + token,
    });
});
// 🔒 Protected endpoint (requires valid token)
router.get("/protected", auth_middleware_1.requireAuth, (req, res) => {
    res.json({
        message: "Auth middleware working ✅",
        user: req.user,
    });
});
exports.default = router;
