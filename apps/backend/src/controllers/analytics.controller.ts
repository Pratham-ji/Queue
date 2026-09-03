import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getProviderAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { clinicId } = req.query; // Optional filter by clinic

    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    // Ensure the provider is part of this clinic (or any clinic if no clinicId)
    const memberships = await prisma.clinicMember.findMany({
      where: { userId, ...(clinicId ? { clinicId: String(clinicId) } : {}) },
      select: { clinicId: true },
    });

    const clinicIds = memberships.map((m) => m.clinicId);

    if (clinicIds.length === 0) {
      return res.json({
        success: true,
        data: {
          totalPatients: 0,
          avgWaitTime: 0,
          prescriptionsIssued: 0,
          trend: "+0%",
          trendUp: true,
        },
      });
    }

    // 1. Total Patients Served (where status = COMPLETED)
    const totalPatients = await prisma.patient.count({
      where: {
        clinicId: { in: clinicIds },
        status: "COMPLETED",
      },
    });

    // 2. Average Wait Time (servedTime - arrivalTime in minutes)
    const servedPatients = await prisma.patient.findMany({
      where: {
        clinicId: { in: clinicIds },
        status: "COMPLETED",
        servedTime: { not: null },
      },
      select: { arrivalTime: true, servedTime: true },
    });

    let avgWaitTime = 0;
    if (servedPatients.length > 0) {
      const totalWaitMs = servedPatients.reduce((acc, p) => {
        return acc + (p.servedTime!.getTime() - p.arrivalTime.getTime());
      }, 0);
      avgWaitTime = Math.round(totalWaitMs / servedPatients.length / 60000); // minutes
    }

    // 3. Prescriptions Issued
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    let prescriptionsIssued = 0;
    if (doctorProfile) {
      prescriptionsIssued = await prisma.prescription.count({
        where: { doctorId: doctorProfile.id },
      });
    }

    // Mock trend data for pitch video impact
    // In production, you would compare current week vs last week.
    const trend = "12%";
    const trendUp = true;

    res.json({
      success: true,
      data: {
        totalPatients,
        avgWaitTime,
        prescriptionsIssued,
        trend,
        trendUp,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch analytics" });
  }
};
