import { Router } from "express";
import {
  getPagesByRole,
  getPageBySlug,
  upsertPage,
  deletePage,
} from "../controllers/page.controller";

const router = Router();

// 📄 PUBLIC ENDPOINTS (Both apps can use)

// Get all pages available for a role
// Usage: GET /api/pages?role=PROVIDER
// Usage: GET /api/pages?role=USER
router.get("/", getPagesByRole);

// Get a specific page by slug
// Usage: GET /api/pages/help?role=PROVIDER
// Usage: GET /api/pages/terms?role=USER
router.get("/:slug", getPageBySlug);

// 📝 ADMIN ENDPOINTS (Create/Update/Delete pages)
// TODO: Add authentication middleware to protect these routes

// Create or update a page
// POST /api/pages/admin
router.post("/admin", upsertPage);

// Delete a page
// DELETE /api/pages/admin/help
router.delete("/admin/:slug", deletePage);

export default router;
