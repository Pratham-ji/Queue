import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

// 1. GET ALL PENDING CLINICS (The "Inbox")
export const getPendingClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await prisma.clinic.findMany({
      where: {
        // We want clinics that are NOT verified yet
        verified: false,
      },
      include: {
        users: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res
      .status(200)
      .json({ success: true, count: clinics.length, data: clinics });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// 2. APPROVE A CLINIC (The "Golden Stamp")
export const approveClinic = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params as { clinicId: string };

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        verified: true, // <--- This makes them Live on the user app!
      },
    });

    res.status(200).json({
      success: true,
      message: `Clinic ${clinic.name} is now LIVE! 🦄`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Could not approve clinic" });
  }
};
