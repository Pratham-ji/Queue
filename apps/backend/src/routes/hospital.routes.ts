import express from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.middleware";
import { Role } from "../role/role.enum";
import {
  getClinics,
  getDoctors,
  getClinicDetails,
} from "../controllers/hospital.controller";

const router = express.Router();

// Public endpoints
router.get("/clinics", getClinics);
router.get("/clinics/:id", getClinicDetails);
router.get("/doctors", getDoctors);

export default router;
