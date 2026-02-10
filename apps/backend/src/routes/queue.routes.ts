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

// ✅ MATCH: GET /api/queue/clinic_1
router.get("/:clinicId", getQueue);
// ✅ MATCH: POST /api/queue/clinic_1/next
// We add '/:clinicId/next' so it matches what the mobile app sends
router.post("/:clinicId/next", callNextPatient);

// Keep this for future use (User App will use this)
router.post("/add", addPatient);

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
