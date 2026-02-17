import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { Role } from "@prisma/client"; // Import the enum we just made

export const getPendingClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await prisma.clinic.findMany({
      where: { verified: false }, // Ensure 'npx prisma db push' was run
      include: {
        users: {
          select: {
            name: true,
            email: true,
            phoneVerified: true,
            aadhaarVerified: true,
          },
        },
        doctors: true,
      },
    });
    res.status(200).json({ success: true, data: clinics });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const approveClinic = async (req: Request, res: Response) => {
  try {
    // FIX: Destructure with explicit type to solve "string | string[]" error
    const { clinicId } = req.params as { clinicId: string };

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: { verified: true },
    });

    res
      .status(200)
      .json({ success: true, message: `Clinic ${clinic.name} is LIVE!` });
  } catch (err) {
    res.status(500).json({ success: false, error: "Approval failed" });
  }
};

// ==========================================
// ASSIGN STAFF ROLE (The Unicorn Feature )
// ==========================================
export const assignStaffRole = async (req: Request, res: Response) => {
  try {
    const { email, role, clinicId } = req.body;

    // 1. Validation: Ensure the role is valid
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ error: "Invalid role selected" });
    }

    // 2. Find the user (or create a placeholder if they haven't signed up yet)
    // For now, we assume the user exists in the system
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User email not found. Ask them to signup first." });
    }

    // 3. UPDATE THE USER: Give them the Badge & The Building
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: role as Role,
        clinicId: clinicId,
      },
    });

    console.log(`👮‍♂️ RBAC: Assigned ${role} to ${email} for Clinic ${clinicId}`);

    res.status(200).json({
      success: true,
      message: `User is now a ${role}`,
      data: {
        name: updatedUser.name,
        role: updatedUser.role,
        clinicId: updatedUser.clinicId,
      },
    });
  } catch (error) {
    console.error("RBAC Error:", error);
    res.status(500).json({ error: "Failed to assign role" });
  }
};
