import { Request, Response } from "express";
import { s3Client } from "../utils/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const uploadToDirectoryBucket = async (req: Request, res: Response) => {
  try {
    const file = req.file; // Provided by multer middleware
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Directory buckets require a specific path format
    const key = `compliance/${Date.now()}-${file.originalname}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer, // Binary data from memoryStorage
        ContentType: file.mimetype,
      }),
    );

    res.status(200).json({
      success: true,
      fileKey: key,
      url: `https://${process.env.S3_BUCKET_NAME}.s3express-${process.env.S3_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error("S3 Express Error:", error);
    res.status(500).json({ error: "Cloud upload failed" });
  }
};
