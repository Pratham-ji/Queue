import express from "express";
import { createPrescription, getClinicPrescriptions } from "../controllers/prescription.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = express.Router();

// Create a new prescription (Doctor only - verified in controller)
router.post("/create", requireAuth, createPrescription);

// Get prescriptions for a specific clinic (Pharmacy staff / Doctors)
router.get("/clinic/:clinicId", requireAuth, getClinicPrescriptions);

export default router;
