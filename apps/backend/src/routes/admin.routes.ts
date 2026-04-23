import express from "express";
import {
  getPendingClinics,
  approveClinic,
} from "../controllers/admin.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = express.Router();

// requireAuth = Must be logged in
// requireRole(["SUPER_ADMIN"]) = Must have role: "ADMIN" in database

router.get("/pending", requireAuth, requireRole(["SUPER_ADMIN"]), getPendingClinics);
router.patch("/approve/:clinicId", requireAuth, requireRole(["SUPER_ADMIN"]), approveClinic);

export default router;
