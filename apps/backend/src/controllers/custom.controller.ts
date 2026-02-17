import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

// 1. CREATE SESSION
export const createSession = async (req: Request, res: Response) => {
  try {
    const { title, hostId, hostName } = req.body; // <--- The culprit is likely here

    const joinCode = Math.floor(100000 + Math.random() * 900000).toString();

    const session = await prisma.customSession.create({
      data: {
        title: title as string, // 👈 Cast to string
        hostId: hostId as string, // 👈 Cast to string
        // 👇 FIX: Handle potential array or undefined
        hostName: (hostName as string) || "Host",
        joinCode,
        status: "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error("Create Session Error:", error);
    res.status(500).json({ success: false, error: "Failed to create session" });
  }
};
// 2. JOIN SESSION
export const joinSession = async (req: Request, res: Response) => {
  try {
    const { joinCode, name } = req.body;

    const session = await prisma.customSession.findUnique({
      where: { joinCode },
      include: { participants: true },
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    }

    if (session.status !== "ACTIVE") {
      // 👈 Fixed: Check 'status' instead of 'isActive'
      return res
        .status(400)
        .json({ success: false, error: "Session has ended" });
    }

    // Calculate Token (Last token + 1)
    const lastToken =
      session.participants.length > 0
        ? session.participants[session.participants.length - 1].token
        : 0;

    const newToken = lastToken + 1;

    // 👇 Fixed: Use 'customParticipant' instead of 'sessionParticipant'
    const participant = await prisma.customParticipant.create({
      data: {
        name,
        token: newToken,
        sessionId: session.id,
        status: "WAITING",
      },
    });

    // Notify via Socket
    const io = req.app.get("io");
    io.to(`session_${session.id}`).emit("participant_joined", participant);

    res.status(200).json({ success: true, data: participant, session });
  } catch (error) {
    console.error("Join Session Error:", error);
    res.status(500).json({ success: false, error: "Failed to join session" });
  }
};

// 3. GET SESSION DETAILS
export const getSessionDetails = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.customSession.findUnique({
      where: { id: sessionId as string },
      include: {
        participants: {
          orderBy: { token: "asc" },
        },
      },
    });

    if (!session)
      return res.status(404).json({ success: false, error: "Not Found" });

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// 4. CALL NEXT (The Fix from before)
export const callNext = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    // 1. Mark the CURRENTLY serving person as COMPLETED
    await prisma.customParticipant.updateMany({
      where: {
        sessionId: sessionId,
        status: "SERVING",
      },
      data: {
        status: "COMPLETED",
      },
    });

    // 2. Find the NEXT person in line
    const nextPerson = await prisma.customParticipant.findFirst({
      where: {
        sessionId: sessionId,
        status: "WAITING",
      },
      orderBy: {
        token: "asc",
      },
    });

    if (!nextPerson) {
      // Broadcast empty state to update UI immediately
      const io = req.app.get("io");
      const allParticipants = await prisma.customParticipant.findMany({
        where: { sessionId },
        orderBy: { token: "asc" },
      });
      io.to(`session_${sessionId}`).emit("queue_updated_list", allParticipants);

      return res.json({ success: false, error: "Queue is empty!" });
    }

    // 3. Mark the NEW person as SERVING
    const updatedPerson = await prisma.customParticipant.update({
      where: { id: nextPerson.id },
      data: { status: "SERVING" },
    });

    // 4. Broadcast the FULL LIST to ensure everyone is synced
    const io = req.app.get("io");
    const allParticipants = await prisma.customParticipant.findMany({
      where: { sessionId },
      orderBy: { token: "asc" },
    });

    io.to(`session_${sessionId}`).emit("queue_updated_list", allParticipants);

    res.json({ success: true, data: updatedPerson });
  } catch (error) {
    console.error("Call Next Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
