import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. START A QUEUE (Host)
export const createSession = async (req: Request, res: Response) => {
  try {
    const { hostName, title } = req.body;

    // Ensure unique code logic (Simple retry mechanism could be added here later)
    const joinCode = Math.floor(100000 + Math.random() * 900000).toString();

    const session = await prisma.customSession.create({
      data: { hostName, title, joinCode },
    });

    res.status(201).json({ success: true, data: session });
  } catch (error: any) {
    // PRINT THE REAL ERROR TO TERMINAL
    console.error("❌ Create Session Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create session. Check server logs.",
    });
  }
};

// 2. JOIN A QUEUE (Guest)
export const joinSession = async (req: Request, res: Response) => {
  try {
    const { joinCode, name } = req.body;

    const session = await prisma.customSession.findUnique({
      where: { joinCode },
      include: { participants: true },
    });

    if (!session || !session.isActive) {
      return res
        .status(404)
        .json({ success: false, error: "Queue not found or ended" });
    }

    const token = session.participants.length + 1;

    const participant = await prisma.sessionParticipant.create({
      data: {
        name,
        token,
        sessionId: session.id,
        status: "WAITING",
      },
    });

    // ⚡ REAL-TIME ALERT: Tell the Host someone joined
    const io = req.app.get("io");
    io.to(`session_${session.id}`).emit("participant_joined", participant);

    res.status(200).json({ success: true, data: participant, session });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to join queue" });
  }
};

// 3. GET DETAILS (Sync)
export const getSessionDetails = async (req: Request, res: Response) => {
  try {
    // ⚠️ FIX: Cast as string to satisfy TypeScript
    const sessionId = req.params.sessionId as string;

    const session = await prisma.customSession.findUnique({
      where: { id: sessionId },
      include: { participants: { orderBy: { token: "asc" } } },
    });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// 4. CALL NEXT PARTICIPANT (Host Action)
export const callNext = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    // 1. Find next waiting person
    const nextPerson = await prisma.sessionParticipant.findFirst({
      where: { sessionId, status: "WAITING" },
      orderBy: { token: "asc" },
    });

    if (!nextPerson) {
      return res.status(400).json({ success: false, error: "Queue is empty" });
    }

    // 2. Update status
    const updatedPerson = await prisma.sessionParticipant.update({
      where: { id: nextPerson.id },
      data: { status: "SERVING" },
    });

    // 3. Notify the Room (Real-time magic)
    const io = req.app.get("io");

    // Emit specific event for UI updates
    io.to(`session_${sessionId}`).emit("queue_updated", updatedPerson);

    res.json({ success: true, data: updatedPerson });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
