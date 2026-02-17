import express from "express";
import {
  getPendingClinics,
  approveClinic,
  assignStaffRole, // <--- Import this!
} from "../controllers/admin.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = express.Router();

// Existing routes
router.get("/pending", protect, adminOnly, getPendingClinics);
router.patch("/approve/:clinicId", protect, adminOnly, approveClinic);

// 🦄 NEW: The Staff Assignment Route
router.post("/assign-role", protect, adminOnly, assignStaffRole);

export default router;
