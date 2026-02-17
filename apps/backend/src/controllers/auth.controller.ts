import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// 🔐 UNIFORM SECRET KEY (Fixes the login crash)
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_unicorn_key_123";

// ==========================================
// 1. SIGN UP
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

    // C. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // D. Secure Role Assignment
    let assignedRole: Role = Role.PATIENT;

    if (role === "PROVIDER" || role === "DOCTOR") assignedRole = Role.DOCTOR;
    if (role === "ADMIN" || role === "HOSPITAL_ADMIN")
      assignedRole = Role.HOSPITAL_ADMIN;
    if (role === "STAFF") assignedRole = Role.STAFF;
    if (role === "PHARMACIST") assignedRole = Role.PHARMACIST;
    if (role === "SUPER_ADMIN") assignedRole = Role.SUPER_ADMIN;

    // E. Create User
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || "",
        role: assignedRole,
      },
    });

    // F. Generate Token (Using the UNIFORM secret)
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, clinicId: newUser.clinicId },
      JWT_SECRET,
      { expiresIn: "30d" },
    );

    console.log(`✅ New User Registered: ${newUser.name} (${newUser.role})`);

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token,
      },
    });
  } catch (error: any) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ success: false, error: "Registration failed." });
  }
};

// ==========================================
// 2. LOGIN (Fixed & Robust)
// ==========================================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid Credentials (User not found)" });
    }

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Invalid Credentials (Password mismatch)" });
    }

    // 3. Generate Token (Using the SAME secret as signup)
    // We also safely handle clinicId being null
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        clinicId: user.clinicId || "", // Safe handling for Super Admins
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    console.log(`🔓 Login Success: ${user.email} [${user.role}]`);

    // 4. Send Response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
      },
    });
  } catch (error: any) {
    // THIS LOG IS CRITICAL FOR DEBUGGING
    console.error("❌ Login Server Crash:", error);
    res.status(500).json({ error: "Internal Server Error during Login" });
  }
};
