import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// ==========================================
// 1. GET MY CLINICS — All clinics this provider is a member of
// ==========================================
export const getMyClinics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const memberships = await prisma.clinicMember.findMany({
      where: { userId },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            image: true,
            verified: true,
            rating: true,
            _count: { select: { patients: true, doctors: true } },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    const data = memberships.map((m) => ({
      ...m.clinic,
      memberRole: m.role,
      isPrimary: m.isPrimary,
      membershipId: m.id,
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("getMyClinics error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ==========================================
// 2. GET MY ACTIVE CLINIC — The clinic marked isPrimary=true
// ==========================================
export const getMyActiveClinic = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Find primary membership
    const membership = await prisma.clinicMember.findFirst({
      where: { userId, isPrimary: true },
      include: {
        clinic: {
          include: {
            doctors: true,
            patients: {
              where: { status: "WAITING" },
              orderBy: { token: "asc" },
            },
          },
        },
      },
    });

    if (!membership) {
      // Fallback: try ownerId for backward compat
      const ownedClinic = await prisma.clinic.findFirst({
        where: { ownerId: userId },
        include: {
          doctors: true,
          patients: {
            where: { status: "WAITING" },
            orderBy: { token: "asc" },
          },
        },
      });

      if (ownedClinic) {
        return res.json({ success: true, data: ownedClinic, role: "OWNER" });
      }

      return res.status(404).json({
        success: false,
        error: "No active clinic. Register or switch to a clinic.",
      });
    }

    res.json({
      success: true,
      data: membership.clinic,
      role: membership.role,
    });
  } catch (error) {
    console.error("getMyActiveClinic error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ==========================================
// 3. SWITCH ACTIVE CLINIC — Set isPrimary on target, clear others
// ==========================================
export const switchClinic = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { clinicId } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!clinicId) return res.status(400).json({ error: "clinicId is required" });

    // Verify user is actually a member of this clinic
    const membership = await prisma.clinicMember.findUnique({
      where: { userId_clinicId: { userId, clinicId } },
    });

    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this clinic" });
    }

    // Transaction: clear all isPrimary for this user, set the target
    await prisma.$transaction([
      prisma.clinicMember.updateMany({
        where: { userId },
        data: { isPrimary: false },
      }),
      prisma.clinicMember.update({
        where: { id: membership.id },
        data: { isPrimary: true },
      }),
    ]);

    res.json({ success: true, message: `Switched to clinic: ${clinicId}` });
  } catch (error) {
    console.error("switchClinic error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ==========================================
// 4. GET PROVIDER PROFILE — User details + active clinic
// ==========================================
export const getProviderProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        clinicMemberships: {
          include: {
            clinic: {
              select: { id: true, name: true, city: true, image: true, verified: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Find the primary clinic
    const primaryMembership = user.clinicMemberships.find((m) => m.isPrimary);

    res.json({
      success: true,
      data: {
        ...user,
        activeClinic: primaryMembership?.clinic || null,
        activeRole: primaryMembership?.role || null,
      },
    });
  } catch (error) {
    console.error("getProviderProfile error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const toggleEmergency = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { clinicId, isEmergencyPause, emergencyMessage } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!clinicId) return res.status(400).json({ error: "clinicId is required" });

    // Verify user is an ADMIN or OWNER of the clinic
    const membership = await prisma.clinicMember.findUnique({
      where: { userId_clinicId: { userId, clinicId } },
    });

    if (!membership || !["OWNER", "ADMIN", "DOCTOR"].includes(membership.role)) {
      return res.status(403).json({ error: "You don't have permission to toggle emergency status" });
    }

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        isEmergencyPause,
        emergencyMessage: isEmergencyPause ? emergencyMessage || "Emergency" : null,
      },
    });

    // Broadcast event
    const io = req.app.get("io");
    if (io) {
      io.emit(`clinic_emergency_${clinicId}`, {
        isEmergencyPause,
        emergencyMessage: clinic.emergencyMessage,
      });
    }

    res.json({ success: true, data: clinic });
  } catch (error) {
    console.error("toggleEmergency error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const toggleOnlineStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { clinicId, isOnline } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!clinicId) return res.status(400).json({ error: "clinicId is required" });

    const membership = await prisma.clinicMember.findUnique({
      where: { userId_clinicId: { userId, clinicId } },
    });

    if (!membership || !["OWNER", "ADMIN", "DOCTOR"].includes(membership.role)) {
      return res.status(403).json({ error: "No permission" });
    }

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: { isOnline },
    });

    const io = req.app.get("io");
    if (io) {
      io.emit(`clinic_online_${clinicId}`, { isOnline });
    }

    res.json({ success: true, data: clinic });
  } catch (error) {
    console.error("toggleOnline error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
