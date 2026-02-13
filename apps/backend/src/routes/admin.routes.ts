import express from "express";
import {
  getPendingClinics,
  approveClinic,
} from "../controllers/admin.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

// protect = Must be logged in
// authorize("ADMIN") = Must have role: "ADMIN" in database

router.get("/pending", protect, authorize("ADMIN"), getPendingClinics);
router.patch("/approve/:clinicId", protect, authorize("ADMIN"), approveClinic);

export default router;
