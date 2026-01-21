import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

// Initialize the Database Client
const prisma = new PrismaClient();

// GET QUEUE (Read from Real Database)
export const getQueue = async (req: Request, res: Response) => {
  try {
    // 1. Get the Clinic (For now, we just grab the first one found)
    const clinic = await prisma.clinic.findFirst();

    if (!clinic) {
      return res.status(404).json({
        success: false,
        error: "Clinic not found. Did you run the seed script?",
      });
    }

    // 2. Fetch waiting patients from DB
    const queue = await prisma.patient.findMany({
      where: {
        clinicId: clinic.id,
        status: "WAITING",
      },
      orderBy: { token: "asc" },
    });

    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// CALL NEXT PATIENT (Update Real Database)
export const callNextPatient = async (req: Request, res: Response) => {
  try {
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return res.status(404).json({ message: "No clinic found" });

    // 1. Find the next person in line
    const nextPatient = await prisma.patient.findFirst({
      where: { clinicId: clinic.id, status: "WAITING" },
      orderBy: { token: "asc" },
    });

    if (!nextPatient) {
      return res
        .status(400)
        .json({ success: false, message: "Queue is empty" });
    }

    // 2. Update their status to SERVING
    const served = await prisma.patient.update({
      where: { id: nextPatient.id },
      data: {
        status: "SERVING",
        servedTime: new Date(),
      },
    });

    // 3. Notify Mobile App (Socket.io)
    // We send the *remaining* waiting list to update the screen
    const io = req.app.get("io");
    const remainingQueue = await prisma.patient.findMany({
      where: { clinicId: clinic.id, status: "WAITING" },
      orderBy: { token: "asc" },
    });

    io.emit("queue_update", remainingQueue);

    res.status(200).json({ success: true, served });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error calling next" });
  }
};

// ADD PATIENT (Write to Real Database + Socket Emit)
export const addPatient = async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    // 1. Find the clinic (In a real app, this comes from the logged-in user)
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return res.status(404).json({ error: "Clinic not found" });

    // 2. Generate the next Token Number (Count current patients + 1)
    // We count *all* patients created today to make a unique token
    const todayCount = await prisma.patient.count({
      where: { clinicId: clinic.id },
    });
    const token = todayCount + 1;

    // 3. Create the Patient in AWS
    const newPatient = await prisma.patient.create({
      data: {
        name,
        phone: phone || "", // Phone is optional
        token,
        status: "WAITING",
        clinicId: clinic.id,
      },
    });

    // 4. REAL-TIME UPDATE: Tell everyone the queue changed
    const io = req.app.get("io");
    const updatedQueue = await prisma.patient.findMany({
      where: { clinicId: clinic.id, status: "WAITING" },
      orderBy: { token: "asc" },
    });

    io.emit("queue_update", updatedQueue);

    res.status(201).json({ success: true, data: newPatient });
  } catch (error) {
    console.error("Error adding patient:", error);
    res.status(500).json({ success: false, error: "Failed to add patient" });
  }
};
