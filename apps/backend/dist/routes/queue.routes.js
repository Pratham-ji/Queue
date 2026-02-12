"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queue_controller_1 = require("../controllers/queue.controller");
const router = (0, express_1.Router)();
// ✅ MATCH: GET /api/queue/clinic_1
router.get("/:clinicId", queue_controller_1.getQueue);
// ✅ MATCH: POST /api/queue/clinic_1/next
// We add '/:clinicId/next' so it matches what the mobile app sends
router.post("/:clinicId/next", queue_controller_1.callNextPatient);
// Keep this for future use (User App will use this)
router.post("/add", queue_controller_1.addPatient);
exports.default = router;
