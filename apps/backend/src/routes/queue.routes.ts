// apps/backend/src/routes/queue.routes.ts

import { Router } from "express";
import {
  getQueue,
  callNextPatient,
  addPatient,
} from "../controllers/queue.controller";

const router = Router();

// 1. GET Queue (Specific Clinic)
router.get("/:clinicId", getQueue);

// 2. Call Next (Specific Clinic)
router.post("/:clinicId/next", callNextPatient);

// 3. Add Patient (Specific Clinic) <--- UPDATE THIS LINE
router.post("/:clinicId/add", addPatient);

export default router;
