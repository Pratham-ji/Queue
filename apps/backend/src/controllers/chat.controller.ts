import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getMyThreads = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    let threads: any[] = [];
    
    // If they are a PROVIDER, try to fetch their doctor profile threads
    if (role === "PROVIDER") {
      const doc = await prisma.doctorProfile.findUnique({ where: { userId } });
      if (doc) {
        const docThreads = await prisma.chatThread.findMany({
          where: { doctorId: doc.id },
          include: { user: { select: { id: true, name: true } } },
          orderBy: { updatedAt: "desc" }
        });
        threads = [...threads, ...docThreads];
      }
    }

    // Always fetch patient threads (a provider can also be a patient)
    const patientThreads = await prisma.chatThread.findMany({
      where: { userId },
      include: { doctor: { select: { id: true, name: true, image: true } } },
      orderBy: { updatedAt: "desc" }
    });
    threads = [...threads, ...patientThreads];

    // Sort combined threads
    threads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    res.json({ success: true, data: threads });
  } catch (error) {
    console.error("getMyThreads Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch threads" });
  }
};

export const startThread = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { doctorId } = req.body;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    // Check if an active thread already exists
    const existing = await prisma.chatThread.findFirst({
      where: { userId, doctorId, isActive: true },
    });
    if (existing) {
      return res.json({ success: true, data: existing });
    }

    // CREDIT SYSTEM CHECK
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.credits < 10) {
      return res.status(402).json({ 
        success: false, 
        error: "Insufficient credits. Please recharge your wallet." 
      });
    }

    // Deduct credits and create thread in a transaction
    const [_, newThread] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: 10 } }
      }),
      prisma.chatThread.create({
        data: {
          userId,
          doctorId,
          isActive: true
        }
      })
    ]);

    res.json({ success: true, data: newThread });
  } catch (error) {
    console.error("startThread Error:", error);
    res.status(500).json({ success: false, error: "Failed to start chat" });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const threadId = req.params.threadId as string;
    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" }
    });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { threadId, content } = req.body;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
    if (!thread) return res.status(404).json({ success: false, error: "Thread not found" });
    if (!thread.isActive) return res.status(403).json({ success: false, error: "Thread is closed" });

    const message = await prisma.message.create({
      data: {
        threadId,
        content,
        senderId: userId
      }
    });

    // Update thread timestamp for sorting
    await prisma.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() }
    });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error("sendMessage Error:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
};
