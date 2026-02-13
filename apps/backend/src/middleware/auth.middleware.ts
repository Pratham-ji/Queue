import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_unicorn_key_123";

// Extend the Express Request interface to include our User
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// 1. VERIFY TOKEN (Is the user logged in?)
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;

  // Check for the Bearer token in the header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If no token found
  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Not authorized to access this route" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Attach the user to the request object
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Not authorized" });
  }
};
