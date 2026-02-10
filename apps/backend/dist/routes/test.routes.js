"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/protected", auth_middleware_1.requireAuth, (req, res) => {
    res.json({
        message: "Auth middleware working",
        user: req.user,
    });
});
exports.default = router;
