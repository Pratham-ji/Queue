import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export type AuthRequest = Request & {
  user?: {
    userId: string;
    role: string;
  };
};

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        message: "Missing Authorization header",
        hint: "Send: Authorization: Bearer <token>"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        message: "Invalid token format",
        hint: "Use 'Bearer <token>' format"
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        message: "Empty token provided"
      });
    }

    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(401).json({ 
      message: "Invalid or expired token",
      error: errorMessage
    });
  }
};
