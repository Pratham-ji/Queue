import express from "express";
import { Role } from "../role/role.enum";
import { requireAuth, authorizeRoles } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/call-next", requireAuth, authorizeRoles(Role.PROVIDER),
(req, res) => {
    res.json({ message: "Calling next Patient" });
});

export default router;
