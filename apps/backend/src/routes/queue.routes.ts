import { Router } from "express";
import {
  getQueue,
  callNextPatient,
  addPatient,
} from "../controllers/queue.controller";

const router = Router();

// ✅ MATCH: GET /api/queue/clinic_1
router.get("/:clinicId", getQueue);

// ✅ MATCH: POST /api/queue/clinic_1/next
// We add '/:clinicId/next' so it matches what the mobile app sends
router.post("/:clinicId/next", callNextPatient);

// Keep this for future use (User App will use this)
router.post("/add", addPatient);

export default router;
