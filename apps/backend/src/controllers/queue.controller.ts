import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendPushNotification } from "../services/pushNotification";

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

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { isEmergencyPause: true, emergencyMessage: true }
    });

    const current = await prisma.patient.findFirst({
      where: {
        clinicId,
        status: "SERVED",
      },
      orderBy: { updatedAt: "desc" },
    });

    if (queue.length === 0 && !current) {
      return res.status(200).json({
        success: true,
        data: [],
        current: null,
        clinic,
        message: "Queue is empty",
      });
    }

    res.status(200).json({ success: true, data: queue, current, clinic });
  } catch (error) {
    console.error("getQueue error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ==========================================
// 2. CALL NEXT PATIENT — Transaction-protected
// ==========================================
export const callNextPatient = async (req: Request, res: Response) => {
  try {
    const clinicId = req.params.clinicId as string;

    // Use transaction to prevent race conditions when two admins click simultaneously
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find who is next (lock the row via transaction)
      const nextPatient = await tx.patient.findFirst({
        where: {
          clinicId: clinicId,
          status: "WAITING",
        },
        orderBy: { token: "asc" },
      });

      if (!nextPatient) {
        return null;
      }

      // 2. Update status to SERVING
      const served = await tx.patient.update({
        where: { id: nextPatient.id },
        data: {
          status: "SERVING",
          servedTime: new Date(),
        },
      });

      return served;
    });

    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "Queue is empty" });
    }

    // 3. BROADCAST TO ALL APPS (outside transaction — fire-and-forget)
    const io = req.app.get("io");

    const remainingQueue = await prisma.patient.findMany({
      where: { clinicId: clinicId, status: "WAITING" },
      orderBy: { token: "asc" },
    });

    io.to(clinicId).emit("queue_update", remainingQueue);
    io.to(clinicId).emit("current_patient", result);

    // --- PUSH NOTIFICATION PIPELINE (non-blocking) ---
    try {
      // Position 1: The patient who is NOW being served
      if (result.expoPushToken) {
        await sendPushNotification(
          result.expoPushToken,
          "It's Your Turn! 🏥",
          "Please enter the doctor's room now."
        );
      }
      
      // Position 2: The patient who is NEXT after the current one
      if (remainingQueue.length > 0 && remainingQueue[0].expoPushToken) {
        await sendPushNotification(
          remainingQueue[0].expoPushToken,
          "You're Almost Up! ⏳",
          "You're next in line — please head to the waiting area."
        );
      }
    } catch (pushError) {
      console.error("Push dispatch failed (non-fatal):", pushError);
    }

    res.status(200).json({ success: true, served: result });
  } catch (error: any) {
    console.error("Error calling next:", error.message || error);
    res.status(500).json({ success: false, error: "Error calling next" });
  }
};

// ==========================================
// 3. ADD PATIENT
// ==========================================
export const addPatient = async (req: Request, res: Response) => {
  try {
    const { name, phone, expoPushToken } = req.body;
    const clinicId = req.params.clinicId as string;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) return res.status(404).json({ error: "Clinic not found" });

    // Generate Token (transaction to prevent duplicate tokens)
    const newPatient = await prisma.$transaction(async (tx) => {
      const todayCount = await tx.patient.count({
        where: { clinicId: clinic.id },
      });
      const token = todayCount + 1;

      return tx.patient.create({
        data: {
          name,
          phone: phone || "",
          token,
          status: "WAITING",
          clinicId: clinic.id,
          expoPushToken: expoPushToken || null,
        },
      });
    });

    // Notify Everyone
    const io = req.app.get("io");
    const updatedQueue = await prisma.patient.findMany({
      where: { clinicId: clinic.id, status: "WAITING" },
      orderBy: { token: "asc" },
    });

    io.to(clinic.id).emit("queue_update", updatedQueue);

    res.status(201).json({ success: true, data: newPatient });
  } catch (error: any) {
    console.error("Error adding patient:", error.message || error);
    res.status(500).json({ success: false, error: "Failed to add patient" });
  }
};

// JOIN QUEUE - Allows a user to join a queue
export const joinQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, clinicId, expoPushToken } = req.body;
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

    // Generate token (transaction for safety)
    const newPatient = await prisma.$transaction(async (tx) => {
      const todayCount = await tx.patient.count({
        where: { clinicId },
      });
      const token = todayCount + 1;

      return tx.patient.create({
        data: {
          name,
          phone: phone || "",
          token,
          status: "WAITING",
          clinicId,
          expoPushToken: expoPushToken || null,
        },
      });
    });

    // Emit real-time update
    const io = req.app.get("io");
    const updatedQueue = await prisma.patient.findMany({
      where: { clinicId, status: "WAITING" },
      orderBy: { token: "asc" },
    });

    io.to(clinicId).emit("queue_update", updatedQueue);

    res.status(201).json({ success: true, data: newPatient });
  } catch (error) {
    console.error("Error joining queue:", error);
    res.status(500).json({ success: false, error: "Failed to join queue" });
  }
};

// CREATE QUEUE - Provider creates a new clinic/queue
export const createQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, city, image } = req.body;
    const userId = req.user?.userId;

    if (!name) {
      return res.status(400).json({ error: "Clinic name is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user already owns a clinic
    const existingClinic = await prisma.clinic.findFirst({
      where: { ownerId: userId },
    });

    if (existingClinic) {
      return res.status(400).json({ error: "You already own a clinic" });
    }

    // Create new clinic with M:N membership
    const newClinic = await prisma.clinic.create({
      data: {
        name,
        address: address || "",
        city: city || "Dehradun",
        image: image || "",
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "OWNER",
            isPrimary: true,
          },
        },
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

    io.to(deletedPatient.clinicId!).emit("queue_update", updatedQueue);

    res.status(200).json({ success: true, message: "Patient removed from queue" });
  } catch (error) {
    console.error("Error deleting from queue:", error);
    res.status(500).json({ success: false, error: "Failed to delete from queue" });
  }
};
