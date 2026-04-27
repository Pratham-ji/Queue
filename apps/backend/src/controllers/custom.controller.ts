import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

// 1. CREATE SESSION
export const createSession = async (req: Request, res: Response) => {
  try {
    const { hostName, title } = req.body;

    const joinCode = Math.floor(100000 + Math.random() * 900000).toString();

    const session = await prisma.customSession.create({
      data: {
        hostName: hostName || "Host",
        title: title || "New Session",
        joinCode,
        isActive: true,
      },
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error("Create Session Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create session." });
  }
};

// 2. JOIN SESSION
export const joinSession = async (req: Request, res: Response) => {
  try {
    const { joinCode, name } = req.body;

    // Find Session
    const session = await prisma.customSession.findUnique({
      where: { joinCode },
      include: { participants: true },
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    }

    if (!session.isActive) {
      return res
        .status(400)
        .json({ success: false, error: "Session has ended" });
    }

    // Token generation inside transaction for safety
    const participant = await prisma.$transaction(async (tx) => {
      const lastParticipant = await tx.sessionParticipant.findFirst({
        where: { sessionId: session.id },
        orderBy: { token: "desc" },
      });

      const nextToken = lastParticipant ? lastParticipant.token + 1 : 1;

      return tx.sessionParticipant.create({
        data: {
          name,
          token: nextToken,
          sessionId: session.id,
          status: "WAITING",
        },
      });
    });

    const io = req.app.get("io");
    io.to(`session_${session.id}`).emit("participant_joined", participant);

    res.status(200).json({ success: true, data: participant, session });
  } catch (error) {
    console.error("Join Error:", error);
    res.status(500).json({ success: false, error: "Failed to join" });
  }
};

// 3. GET DETAILS
export const getSessionDetails = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const session = await prisma.customSession.findUnique({
      where: { id: sessionId },
      include: { participants: { orderBy: { token: "asc" } } },
    });
    if (!session)
      return res.status(404).json({ success: false, error: "Not Found" });
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("Get Session Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// 4. CALL NEXT — Transaction-protected against race conditions
export const callNext = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    const updatedPerson = await prisma.$transaction(async (tx) => {
      // A. Mark current serving as COMPLETED
      await tx.sessionParticipant.updateMany({
        where: { sessionId, status: "SERVING" },
        data: { status: "COMPLETED" },
      });

      // B. Find next WAITING person (locked by transaction)
      const nextPerson = await tx.sessionParticipant.findFirst({
        where: { sessionId, status: "WAITING" },
        orderBy: { token: "asc" },
      });

      if (!nextPerson) {
        return null;
      }

      // C. Mark new person as SERVING
      return tx.sessionParticipant.update({
        where: { id: nextPerson.id },
        data: { status: "SERVING" },
      });
    });

    if (!updatedPerson) {
      return res.json({ success: false, error: "Queue is empty!" });
    }

    const io = req.app.get("io");

    // Broadcast list update
    const allParticipants = await prisma.sessionParticipant.findMany({
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