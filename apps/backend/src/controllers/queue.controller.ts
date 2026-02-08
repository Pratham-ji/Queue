import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==========================================
// 1. GET QUEUE (Robust Version)
// ==========================================
export const getQueue = async (req: Request, res: Response) => {
  try {
    const clinicId = req.params.clinicId as string;

    if (!clinicId) {
      return res
        .status(400)
        .json({ success: false, error: "Clinic ID required" });
    }

    // A. Fetch Waiting List (Sorted by Token)
    const queue = await prisma.patient.findMany({
      where: {
        clinicId: clinicId,
        status: "WAITING",
      },
      orderBy: { token: "asc" },
    });

    // B. Fetch Currently Serving Patient (Latest one)
    const current = await prisma.patient.findFirst({
      where: {
        clinicId: clinicId,
        status: "SERVING",
      },
      orderBy: { servedTime: "desc" }, // Get the most recent one
    });

    // C. Return Combined Data
    res.status(200).json({
      success: true,
      data: queue, // For the waiting list
      current: current, // For "Now Serving: #X"
    });
  } catch (error: any) {
    console.error("❌ Error fetching queue:", error.message || error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ==========================================
// 2. CALL NEXT PATIENT (Triggers Auto-Refresh)
// ==========================================
export const callNextPatient = async (req: Request, res: Response) => {
  try {
    const clinicId = req.params.clinicId as string;

    // 1. Find who is next
    const nextPatient = await prisma.patient.findFirst({
      where: {
        clinicId: clinicId,
        status: "WAITING",
      },
      orderBy: { token: "asc" },
    });

    if (!nextPatient) {
      return res
        .status(400)
        .json({ success: false, message: "Queue is empty" });
    }

    // 2. Update status to SERVING
    const served = await prisma.patient.update({
      where: { id: nextPatient.id },
      data: {
        status: "SERVING",
        servedTime: new Date(),
      },
    });

    // 3. BROADCAST TO ALL APPS (User & Doctor)
    const io = req.app.get("io");

    // A. Send new Waiting List
    const remainingQueue = await prisma.patient.findMany({
      where: { clinicId: clinicId, status: "WAITING" },
      orderBy: { token: "asc" },
    });

    // 📢 Event 1: Updates the list
    io.emit("queue_update", remainingQueue);

    // 📢 Event 2: Updates "Now Serving" dashboard
    io.emit("current_patient", served);

    console.log(`✅ Called Next: Token #${served.token}`);
    res.status(200).json({ success: true, served });
  } catch (error: any) {
    console.error("❌ Error calling next:", error.message || error);
    res.status(500).json({ success: false, error: "Error calling next" });
  }
};

// ==========================================
// 3. ADD PATIENT
// ==========================================
export const addPatient = async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;
    const clinicId = req.params.clinicId as string;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) return res.status(404).json({ error: "Clinic not found" });

    // Generate Token
    const todayCount = await prisma.patient.count({
      where: { clinicId: clinic.id },
    });
    const token = todayCount + 1;

    // Create Patient
    const newPatient = await prisma.patient.create({
      data: {
        name,
        phone: phone || "",
        token,
        status: "WAITING",
        clinicId: clinic.id,
      },
    });

    // Notify Everyone
    const io = req.app.get("io");
    const updatedQueue = await prisma.patient.findMany({
      where: { clinicId: clinic.id, status: "WAITING" },
      orderBy: { token: "asc" },
    });

    io.emit("queue_update", updatedQueue);

    res.status(201).json({ success: true, data: newPatient });
  } catch (error: any) {
    console.error("❌ Error adding patient:", error.message || error);
    res.status(500).json({ success: false, error: "Failed to add patient" });
  }
};
