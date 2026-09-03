import express from "express";
import { signup, login, getMe } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", signup);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me
router.get("/me", requireAuth, getMe);

export default router;
