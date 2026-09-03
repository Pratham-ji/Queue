import express from "express";
import { createPrescription, getClinicPrescriptions, verifyPharmacyOtp, getPatientPrescription } from "../controllers/prescription.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = express.Router();

// Create a new prescription (Doctor only - verified in controller)
router.post("/create", requireAuth, createPrescription);

// Get prescriptions for a specific clinic (Pharmacy staff / Doctors)
router.get("/clinic/:clinicId", requireAuth, getClinicPrescriptions);

// Verify OTP to release medicines
router.post("/:id/verify-otp", requireAuth, verifyPharmacyOtp);

// Get patient prescription
router.get("/patient/active", getPatientPrescription);

export default router;
