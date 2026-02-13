import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// ==========================================
// 1. GET QUEUE (Robust Version)
// ==========================================
export const getQueue = async (req: Request, res: Response) => {
  try {
    const clinicId = req.params.clinicId as string;

    // Fetch waiting patients from DB
    const queue = await prisma.patient.findMany({
      where: {
        clinicId,
        status: "WAITING",
      },
      orderBy: { token: "asc" },
    });

    if (queue.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Queue is empty",
      });
    }

    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    console.error(error);
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

// JOIN QUEUE - Allows a user to join a queue
export const joinQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, clinicId } = req.body;
    const userId = req.user?.userId;

    if (!name || !clinicId) {
      return res.status(400).json({ error: "Name and clinicId are required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) {
      return res.status(404).json({ error: "Clinic not found" });
    }

    // Generate token
    const todayCount = await prisma.patient.count({
      where: { clinicId },
    });
    const token = todayCount + 1;

    // Create patient
    const newPatient = await prisma.patient.create({
      data: {
        name,
        phone: phone || "",
        token,
        status: "WAITING",
        clinicId,
      },
    });

    // Emit real-time update
    const io = req.app.get("io");
    const updatedQueue = await prisma.patient.findMany({
      where: { clinicId, status: "WAITING" },
      orderBy: { token: "asc" },
    });

    io.emit("queue_update", updatedQueue);

    res.status(201).json({ success: true, data: newPatient });
  } catch (error) {
    console.error("Error joining queue:", error);
    res.status(500).json({ success: false, error: "Failed to join queue" });
  }
};

// CREATE QUEUE - Provider creates a new clinic/queue
export const createQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address } = req.body;
    const userId = req.user?.userId;

    if (!name) {
      return res.status(400).json({ error: "Clinic name is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user already owns a clinic
    const existingClinic = await prisma.clinic.findUnique({
      where: { ownerId: userId },
    });

    if (existingClinic) {
      return res.status(400).json({ error: "You already own a clinic" });
    }

    // Create new clinic
    const newClinic = await prisma.clinic.create({
      data: {
        name,
        address: address || "",
        ownerId: userId,
      },
    });

    res.status(201).json({ success: true, data: newClinic });
  } catch (error) {
    console.error("Error creating queue:", error);
    res.status(500).json({ success: false, error: "Failed to create queue" });
  }
};

// DELETE QUEUE - Admin deletes a queue/patient record
export const deleteQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Delete the patient from queue
    const deletedPatient = await prisma.patient.delete({
      where: { id },
    });

    // Emit real-time update
    const io = req.app.get("io");
    const updatedQueue = await prisma.patient.findMany({
      where: { clinicId: deletedPatient.clinicId, status: "WAITING" },
      orderBy: { token: "asc" },
    });

    io.emit("queue_update", updatedQueue);

    res.status(200).json({ success: true, message: "Patient removed from queue" });
  } catch (error) {
    console.error("Error deleting from queue:", error);
    res.status(500).json({ success: false, error: "Failed to delete from queue" });
  }
};
