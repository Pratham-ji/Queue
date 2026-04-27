import {Router} from "express";
import {sendOTP, verifyOtpController} from "./otp.controller"

const router = Router();

router.post("/send-otp",sendOTP);
router.post("/verify-otp",verifyOtpController);
router.post("/otp/verify",verifyOtpController); // alias for mobile app

export default router;