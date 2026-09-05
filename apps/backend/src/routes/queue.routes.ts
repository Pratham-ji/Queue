// apps/backend/src/routes/queue.routes.ts

import { Router } from "express";
import {
  getActivePatientStatus,
  getQueue,
  demoReset,
  callNextPatient,
  addPatient,
  joinQueue,
  createQueue,
  deleteQueue,
  getHistory,
  completePatient,
  skipPatient,
  togglePause,
  resumeQueue,
} from "../controllers/queue.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";


const router = Router();

// GET History (Must come before /:clinicId to avoid matching 'history' as an ID)
router.get("/history", requireAuth, getHistory);

// 1. GET Queue (Specific Clinic)
router.get("/:clinicId", getQueue);
// ✅ MATCH: POST /api/queue/clinic_1/next
// We add '/:clinicId/next' so it matches what the mobile app sends
router.post("/:clinicId/next", callNextPatient);

// 3. Add Patient (Specific Clinic) <--- UPDATE THIS LINE
router.post("/:clinicId/add", addPatient);

// Only logged-in users
router.post("/join", requireAuth, joinQueue);

// Only providers
router.post(
  "/create",
  requireAuth,
  requireRole(["PROVIDER"]),
  createQueue
);

// Admin-only
router.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  deleteQueue
);

// 4. Complete 
router.post("/:clinicId/complete", completePatient);
// 5. Skip
router.post("/:clinicId/skip", skipPatient);
// 6. Pause
router.post("/:clinicId/toggle-pause", togglePause);
// 7. Resume
router.post("/:clinicId/resume", resumeQueue);
router.post("/demo-reset", demoReset);

router.get("/patient/active", getActivePatientStatus);

export default router;
