"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otp_controller_1 = require("./otp.controller");
const router = (0, express_1.Router)();
router.post("/send-otp", otp_controller_1.sendOTP);
router.post("/verify-otp", otp_controller_1.verifyOtpController);
router.post("/otp/verify", otp_controller_1.verifyOtpController); // alias for mobile app
exports.default = router;
