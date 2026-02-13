import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. GET ALL CLINICS (For Home Screen)
export const getClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await prisma.clinic.findMany({
      include: { doctors: true }, // Include doctors to show count/images
    });
    res.json({ success: true, data: clinics });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch clinics" });
  }
};

// 2. GET DOCTORS (For Search/Filter)
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { specialty } = req.query;
    const whereClause = specialty ? { specialty: String(specialty) } : {};

    const doctors = await prisma.doctorProfile.findMany({
      where: whereClause,
      include: { clinic: true },
    });
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch doctors" });
  }
};

// 3. GET CLINIC DETAILS
export const getClinicDetails = async (req: Request, res: Response) => {
  try {
    // ⚠️ FIX: Cast 'id' as string to satisfy TypeScript
    const id = req.params.id as string;

    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: { doctors: true },
    });
    res.json({ success: true, data: clinic });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch clinic details" });
  }
};
