import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==========================================
// CREATE APPOINTMENT
// ==========================================
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { clinicId, patientName, date, time } = req.body;

    if (!clinicId || !patientName || !date || !time) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (clinicId, name, date, time)",
      });
    }

    // 1. Check if slot is taken (Optional - skipping for simplicity now)
    // In a real Unicorn app, you'd check prisma.appointment.findFirst here.

    // 2. Create Booking
    const newAppointment = await prisma.appointment.create({
      data: {
        clinicId,
        patientName,
        date,
        time,
        status: "CONFIRMED",
      },
    });

    console.log(`✅ New Booking: ${patientName} on ${date} at ${time}`);

    res.status(201).json({
      success: true,
      data: newAppointment,
    });
  } catch (error: any) {
    console.error("❌ Booking Error:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Failed to book appointment" });
  }
};

// ==========================================
// GET MY APPOINTMENTS
// ==========================================
export const getMyAppointments = async (req: Request, res: Response) => {
  try {
    const { patientName } = req.query; // We will pass ?patientName=Pratham Raj

    if (!patientName) {
      return res
        .status(400)
        .json({ success: false, error: "Patient name required" });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        patientName: String(patientName),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        clinic: true, // Include clinic details if needed
      },
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error: any) {
    console.error("❌ Fetch Error:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch appointments" });
  }
};
