import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_unicorn_key_123";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

// 1. VERIFY TOKEN (Is the user logged in?)
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Not authorized to access this route" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, error: "Not authorized to access this route" });
  }
};

// 2. VERIFY ROLE (Is the user a Provider/Admin?)
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user?.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// THIS NEW FUNCTION TO FIX THE RED LINE
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore - 'user' is added by the protect middleware
  if (req.user && req.user.role === Role.SUPER_ADMIN) {
    next();
  } else {
    res.status(403).json({ error: "Not authorized as admin" });
  }
};
