import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  getMyThreads,
  startThread,
  getMessages,
  sendMessage
} from "../controllers/chat.controller";

const router = Router();

router.use(requireAuth);

router.get("/threads", getMyThreads);
router.post("/threads/start", startThread);
router.get("/threads/:threadId/messages", getMessages);
router.post("/messages", sendMessage);

export default router;
