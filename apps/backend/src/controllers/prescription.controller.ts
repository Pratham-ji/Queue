import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import crypto from "crypto";

// ==========================================
// 1. CREATE PRESCRIPTION
// ==========================================
export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { medicines, notes, patientId, clinicId } = req.body;
    const userId = req.user?.userId; // This is the Provider's User ID

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ success: false, error: "Medicines array is required" });
    }

    if (!patientId || !clinicId) {
      return res.status(400).json({ success: false, error: "patientId and clinicId are required" });
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // 1. Verify Provider is authorized for this clinic and get their DoctorProfile
    const clinicMember = await prisma.clinicMember.findUnique({
      where: {
        userId_clinicId: {
          userId,
          clinicId,
        },
      },
      include: {
        user: {
          include: {
            doctorProfile: true,
          },
        },
      },
    });

    if (!clinicMember || !clinicMember.user.doctorProfile) {
      return res.status(403).json({ success: false, error: "You are not an authorized doctor for this clinic" });
    }

    const doctorId = clinicMember.user.doctorProfile.id;

    // 2. Verify Patient belongs to this clinic
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || patient.clinicId !== clinicId) {
      return res.status(404).json({ success: false, error: "Patient not found in this clinic" });
    }

    // 3. Generate a secure 6-digit OTP for pharmacy release
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // 4. Create the Prescription
    const newPrescription = await prisma.prescription.create({
      data: {
        medicines,
        notes: notes || "",
        patientId,
        clinicId,
        doctorId,
        otpCode,
        pharmacyStatus: "PENDING",
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // 4. Emit Real-Time Socket Event to the Clinic Room (For Pharmacy / User App)
    const io = req.app.get("io");
    if (io) {
      io.to(clinicId).emit("new_prescription", newPrescription);
    }

    res.status(201).json({ success: true, data: newPrescription });
  } catch (error: any) {
    console.error("Error creating prescription:", error);
    res.status(500).json({ success: false, error: "Failed to create prescription" });
  }
};

// ==========================================
// 2. GET CLINIC PRESCRIPTIONS (For Pharmacy UI)
// ==========================================
export const getClinicPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const clinicId = req.params.clinicId as string;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const userRole = req.user?.role;

    // Check if user is a member of this clinic
    const isMember = await prisma.clinicMember.findUnique({
      where: {
        userId_clinicId: {
          userId,
          clinicId,
        },
      },
    });

    if (!isMember && userRole !== "ADMIN") {
      return res.status(403).json({ success: false, error: "Not authorized for this clinic" });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { clinicId },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch prescriptions" });
  }
};

// ==========================================
// 3. VERIFY PHARMACY OTP & RELEASE
// ==========================================
export const verifyPharmacyOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { otpCode } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!otpCode) {
      return res.status(400).json({ success: false, error: "OTP code is required" });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
      },
    });

    if (!prescription) {
      return res.status(404).json({ success: false, error: "Prescription not found" });
    }

    if (prescription.pharmacyStatus === "FULFILLED") {
      return res.status(400).json({ success: false, error: "Prescription already fulfilled" });
    }

    if (prescription.otpCode !== otpCode) {
      return res.status(400).json({ success: false, error: "Invalid OTP code" });
    }

    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: {
        pharmacyStatus: "FULFILLED",
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Notify the UI to instantly move it to Fulfilled
    const io = req.app.get("io");
    if (io) {
      io.to(prescription.clinicId).emit("prescription_fulfilled", updatedPrescription);
    }

    res.status(200).json({ success: true, data: updatedPrescription });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, error: "Failed to verify OTP" });
  }
};

// ==========================================
// 4. GET ACTIVE PRESCRIPTION FOR PATIENT
// ==========================================
export const getPatientPrescription = async (req: Request, res: Response) => {
  try {
    const { clinicId, token } = req.query;
    if (!clinicId || !token) {
      return res.status(400).json({ success: false, error: "Missing parameters" });
    }
    
    // Find patient by clinic and token
    const patient = await prisma.patient.findFirst({
      where: {
        clinicId: String(clinicId),
        token: parseInt(String(token)),
      },
      orderBy: { createdAt: "desc" }
    });

    if (!patient) {
      return res.status(200).json({ success: true, data: null });
    }

    const prescription = await prisma.prescription.findFirst({
      where: {
        patientId: patient.id,
        pharmacyStatus: "PENDING"
      },
      include: {
        doctor: true,
        patient: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    console.error("Error fetching patient prescription:", error);
    res.status(500).json({ success: false, error: "Failed to fetch prescription" });
  }
};
