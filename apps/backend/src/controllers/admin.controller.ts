import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const getPendingClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await prisma.clinic.findMany({
      where: { verified: false }, // Ensure 'npx prisma db push' was run
      include: {
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phoneVerified: true,
                aadhaarVerified: true,
              },
            },
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
    const { clinicId } = req.params as { clinicId: string };
    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: { verified: true },
    });
    res.json({ success: true, data: clinic });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to approve clinic" });
  }
};

export const getVerifiedClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await prisma.clinic.findMany({
      where: { verified: true },
      include: {
        members: {
          include: { user: true },
        },
        doctors: true,
      },
      orderBy: { name: "asc" }
    });
    res.json({ success: true, data: clinics });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch verified clinics" });
  }
};
