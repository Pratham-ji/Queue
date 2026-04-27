import express from "express";
import { registerClinic, addDoctor } from "../controllers/provider.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = express.Router();

// 1. Onboard Clinic (Only Providers can do this)
router.post(
  "/register-clinic",
  requireAuth,
  requireRole(["PROVIDER", "ADMIN"]),
  registerClinic,
);

// 2. Add Doctor to Clinic
router.post("/add-doctor", requireAuth, requireRole(["PROVIDER", "ADMIN"]), addDoctor);

export default router;
