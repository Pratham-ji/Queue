import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

// Use a single Prisma instance (Best Practice)
const prisma = new PrismaClient();

// ==========================================
// CREATE APPOINTMENT (Now with Socket.io! ⚡)
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

    // 1. Create Booking linked to the Doctor
    const newAppointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientName,
        date,
        time,
        status: "CONFIRMED",
      },
    });

    // 2. REAL-TIME MAGIC: Find the clinic this doctor belongs to
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      select: { clinicId: true, name: true }, // We just need the clinicId to find the right Socket room
    });

    // 3. Broadcast to the Clinic's live dashboard!
    if (doctor && doctor.clinicId) {
      const io = req.app.get("io"); // Grab the Socket engine from app.ts

      io.to(doctor.clinicId).emit("new_patient_joined", {
        message: `🚨 ${patientName} just booked Dr. ${doctor.name} for ${time}!`,
        appointment: newAppointment,
      });

      console.log(`📡 Broadcasted to Clinic Room: ${doctor.clinicId}`);
    }

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
// GET MY APPOINTMENTS (Unchanged)
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
      where: { patientName: String(patientName) },
      orderBy: { createdAt: "desc" },
      include: {
        doctor: {
          include: { clinic: true },
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
