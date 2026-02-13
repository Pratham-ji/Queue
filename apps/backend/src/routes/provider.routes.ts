import express from "express";
import { registerClinic, addDoctor } from "../controllers/provider.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

// 1. Onboard Clinic (Only Providers can do this)
router.post(
  "/register-clinic",
  protect,
  authorize("PROVIDER", "ADMIN"),
  registerClinic,
);

// 2. Add Doctor to Clinic
router.post("/add-doctor", protect, authorize("PROVIDER", "ADMIN"), addDoctor);

export default router;
