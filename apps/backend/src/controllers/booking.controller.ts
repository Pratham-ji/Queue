import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==========================================
// CREATE APPOINTMENT
// ==========================================
export const createAppointment = async (req: Request, res: Response) => {
  try {
    // ⚠️ UPDATE: We now expect doctorId instead of clinicId
    const { doctorId, patientName, date, time } = req.body;

    if (!doctorId || !patientName || !date || !time) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (doctorId, name, date, time)",
      });
    }

    // 1. Create Booking linked to the Doctor
    const newAppointment = await prisma.appointment.create({
      data: {
        doctorId, // Link to the specific doctor
        patientName,
        date,
        time,
        status: "CONFIRMED",
      },
    });

    console.log(
      `✅ New Booking: ${patientName} with Doctor ${doctorId} on ${date}`,
    );

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
      // ⚠️ UPDATE: Fetch Doctor AND their Clinic
      include: {
        doctor: {
          include: {
            clinic: true, // Get the hospital details via the doctor
          },
        },
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
