import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

// ==========================================
// CREATE APPOINTMENT
// ==========================================
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { doctorId, patientName, date, time } = req.body;

    if (!doctorId || !patientName || !date || !time) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (doctorId, name, date, time)",
      });
    }

    // Create Booking linked to the Doctor
    const newAppointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientName,
        date,
        time,
        status: "CONFIRMED",
      },
    });

    res.status(201).json({
      success: true,
      data: newAppointment,
    });
  } catch (error: any) {
    console.error("Booking Error:", error.message);
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
    const { patientName } = req.query;

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
        doctor: {
          include: {
            clinic: true,
          },
        },
      },
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch appointments" });
  }
};
