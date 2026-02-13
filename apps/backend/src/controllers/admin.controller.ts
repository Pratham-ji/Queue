import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

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
