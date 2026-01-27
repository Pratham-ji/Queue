import {Router} from "express";
import {sendOTP, verifyOtpController} from "./otp.controller"

const router = Router();

router.post("/send-otp",sendOTP);
router.post("/verify-otp",verifyOtpController);

export default router;