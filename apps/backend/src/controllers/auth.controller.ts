import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils";

// ==========================================
// 1. SIGN UP (Secure Registration)
// ==========================================
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, clinicName, address } = req.body;

    // Map the incoming string to the VALID Prisma Enum
    let assignedRole: Role = Role.PATIENT; // Default

    if (role === "PROVIDER") assignedRole = Role.PROVIDER;
    else if (role === "ADMIN") assignedRole = Role.ADMIN;
    else if (Object.values(Role).includes(role as Role)) {
      assignedRole = role as Role;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User & Clinic in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: assignedRole,
        },
      });

      if (assignedRole === Role.PROVIDER && clinicName && address) {
        await tx.clinic.create({
          data: {
            name: clinicName,
            address,
            ownerId: newUser.id,
            members: {
              create: {
                userId: newUser.id,
                role: "OWNER",
                isPrimary: true,
              },
            },
          },
        });
      }

      return newUser;
    });

    // Generate Tokens (unified with jwt.utils system)
    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      verified: true,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
    });

    // Strip password from response
    const { password: _, ...safeUser } = user;

    res.status(201).json({
      success: true,
      data: {
        user: safeUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, error: "Signup failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ success: false, error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });

    // Generate Tokens (unified with jwt.utils system)
    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      verified: true,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
    });

    // Strip password from response
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      data: {
        user: safeUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: "Login failed" });
  }
};
