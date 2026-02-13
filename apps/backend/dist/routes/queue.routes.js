"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queue_controller_1 = require("../controllers/queue.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// ✅ MATCH: GET /api/queue/clinic_1
router.get("/:clinicId", queue_controller_1.getQueue);
// ✅ MATCH: POST /api/queue/clinic_1/next
// We add '/:clinicId/next' so it matches what the mobile app sends
router.post("/:clinicId/next", queue_controller_1.callNextPatient);
// Keep this for future use (User App will use this)
router.post("/add", queue_controller_1.addPatient);
// Only logged-in users
router.post("/join", auth_middleware_1.requireAuth, queue_controller_1.joinQueue);
// Only providers
router.post("/create", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(["PROVIDER"]), queue_controller_1.createQueue);
// Admin-only
router.delete("/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(["ADMIN"]), queue_controller_1.deleteQueue);
exports.default = router;
