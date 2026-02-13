// apps/backend/src/routes/queue.routes.ts

import { Router } from "express";
import {
  getQueue,
  callNextPatient,
  addPatient,
  joinQueue,
  createQueue,
  deleteQueue,
} from "../controllers/queue.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";


const router = Router();

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

export default router;
