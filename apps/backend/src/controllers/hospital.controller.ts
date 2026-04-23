import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

// 1. GET ALL CLINICS (For Home Screen)
export const getClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await prisma.clinic.findMany({
      include: { doctors: true },
    });
    res.json({ success: true, data: clinics });
  } catch (error) {
    console.error("getClinics error:", error);
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
    console.error("getDoctors error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch doctors" });
  }
};

// 3. GET CLINIC DETAILS
export const getClinicDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: { doctors: true },
    });

    if (!clinic) {
      return res.status(404).json({ success: false, error: "Clinic not found" });
    }

    res.json({ success: true, data: clinic });
  } catch (error) {
    console.error("getClinicDetails error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch clinic details" });
  }
};
