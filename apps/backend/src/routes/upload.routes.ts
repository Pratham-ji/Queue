import express from "express";
import multer from "multer";
import { uploadToDirectoryBucket } from "../controllers/upload.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// Configure Multer to hold the file in memory temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/upload
router.post("/", protect, upload.single("file"), uploadToDirectoryBucket);

export default router;
