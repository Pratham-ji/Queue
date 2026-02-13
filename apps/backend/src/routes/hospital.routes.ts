import express from "express";
import {Role} from "../role/role.enum";
import {requireAuth , authorizeRoles , checkHospitalScope} from "../middleware/auth.middleware";

const router = express.Router();

export default router.get(
    "/:hospitalId/analytics",requireAuth,authorizeRoles(Role.HOSPITAL_admin),checkHospitalScope,
    (req,res) => {
        res.json({mesage:"Hospital Analytics Data"});
    }
);