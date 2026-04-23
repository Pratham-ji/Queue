import express from "express";
import { Role } from "../role/role.enum";
import { requireAuth, authorizeRoles } from "../middleware/auth.middleware";

const router = express.Router();

export default router.post("/call-next", requireAuth, authorizeRoles(Role.DOCTOR, Role.HOSPITAL_ADMIN),
(req, res) => {
    res.json({ message: "Calling next Patient" });
});
