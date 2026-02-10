import { Request, Response } from "express";
// 1. 👇 UPDATE IMPORT: Add 'Role' to this line
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_unicorn_key_123";

// ==========================================
// 1. SIGN UP (Register)
// ==========================================
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // A. Validation
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // B. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists" });
    }

    // C. Hash Password (Security First 🔒)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // D. Create User
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        // 2. 👇 UPDATE THIS LINE: Use the Enum, not a string
        role: role ? (role as Role) : Role.PATIENT,
      },
    }); // E. Generate Token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token, // Arjun needs this to store in AsyncStorage
      },
    });
  } catch (error: any) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
};

// ==========================================
// 2. LOGIN (Sign In)
// ==========================================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // A. Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and Password required" });
    }

    // B. Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    }

    // C. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    }

    // D. Generate Token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "30d",
    });

    console.log(`✅ User Logged In: ${user.name}`);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: "Login failed" });
  }
};
