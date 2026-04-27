import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  getMyClinics,
  getMyActiveClinic,
  switchClinic,
  getProviderProfile,
} from "../controllers/marketplace.controller";

const router = Router();

// All marketplace routes require auth + PROVIDER or ADMIN role
router.get("/my-clinics", requireAuth, requireRole(["PROVIDER", "ADMIN"]), getMyClinics);
router.get("/my-clinic", requireAuth, requireRole(["PROVIDER", "ADMIN"]), getMyActiveClinic);
router.post("/switch-clinic", requireAuth, requireRole(["PROVIDER", "ADMIN"]), switchClinic);
router.get("/profile", requireAuth, getProviderProfile);

export default router;
