import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// ==========================================
// 1. REGISTER CLINIC (The "Zomato" Onboarding)
// ==========================================
export const registerClinic = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, city, image, description } = req.body;
    const userId = req.user?.id; // Retrieved securely from Token

    // A. Validation
    if (!name || !address) {
      return res.status(400).json({
        success: false,
        error: "Clinic Name and Address are required",
      });
    }

    // B. Check if User already has a clinic (Optional rule: 1 Clinic per Admin)
    const existingClinic = await prisma.clinic.findFirst({
      where: { users: { some: { id: userId } } },
    });

    if (existingClinic) {
      return res.status(400).json({
        success: false,
        error: "You have already registered a clinic.",
      });
    }

    // C. Create the Clinic & Link to Provider
    const newClinic = await prisma.clinic.create({
      data: {
        name,
        address,
        city: city || "Dehradun",
        image:
          image ||
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
        description,
        rating: 4.5, // New clinics start with a default rating or 0
        users: {
          connect: { id: userId }, // 🔗 THE SECURITY LINK: This user owns this clinic
        },
      },
    });

    console.log(`🏥 New Clinic Onboarded: ${name} by Provider ${userId}`);

    res.status(201).json({ success: true, data: newClinic });
  } catch (error: any) {
    console.error("Onboarding Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to register clinic" });
  }
};

// ==========================================
// 2. ADD DOCTOR (Managing Staff)
// ==========================================
export const addDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const { name, specialty, experience, price, image, about, clinicId } =
      req.body;

    // A. Security Check: Does this Provider OWN this clinic?
    const userId = req.user?.id;
    const isOwner = await prisma.clinic.findFirst({
      where: {
        id: clinicId,
        users: { some: { id: userId } },
      },
    });

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to add doctors to this clinic.",
      });
    }

    // B. Create Doctor Profile
    const newDoctor = await prisma.doctorProfile.create({
      data: {
        name,
        specialty,
        experience: Number(experience),
        price: Number(price),
        image:
          image ||
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
        about,
        rating: 5.0, // New doctors start high
        clinicId,
      },
    });

    res.status(201).json({ success: true, data: newDoctor });
  } catch (error: any) {
    console.error("Add Doctor Error:", error);
    res.status(500).json({ success: false, error: "Failed to add doctor" });
  }
};
