import express from "express";
import {
  getPendingClinics,
  approveClinic,
  getVerifiedClinics
} from "../controllers/admin.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = express.Router();

// requireAuth = Must be logged in
// requireRole(["ADMIN"]) = Must have role: "ADMIN" in database

router.get("/pending", requireAuth, requireRole(["ADMIN"]), getPendingClinics);
router.get("/verified", requireAuth, requireRole(["ADMIN"]), getVerifiedClinics);
router.patch("/approve/:clinicId", requireAuth, requireRole(["ADMIN"]), approveClinic);

export default router;
