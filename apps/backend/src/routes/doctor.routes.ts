import express from "express";
import {Role} from "../role/role.enum";
import {requireAuth , authorizeRoles} from "../middleware/auth.middleware";

const router = express.Router();

export default router.post("/call-next",requireAuth,authorizeRoles(Role.PROVIDER),
(req, res) => {
    res.json({mesage:"Calling next Patient"});
});

