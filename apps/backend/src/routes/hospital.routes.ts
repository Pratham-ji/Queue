import express from "express";
import {
  getClinics,
  getDoctors,
  getClinicDetails,
} from "../controllers/hospital.controller";

const router = express.Router();

router.get("/clinics", getClinics);
router.get("/clinics/:id", getClinicDetails);
router.get("/doctors", getDoctors);

export default router;
