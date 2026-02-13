import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { generateAccessToken } from "../utils/jwt.utils";

const router = Router();

// 🔓 Generate test token (for testing only)
router.get("/generate-token", (req, res) => {
  const testUser = {
    userId: "test-user-123",
    role: "USER",
    verified: true,
  };

  const token = generateAccessToken(testUser);

  res.json({
    message: "Test token generated",
    token,
    instructions: "Use this token: Authorization: Bearer " + token,
  });
});

// 🔒 Protected endpoint (requires valid token)
router.get("/protected", requireAuth, (req, res) => {
  res.json({
    message: "Auth middleware working ✅",
    user: req.user,
  });
});

export default router;
