import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("💎 Seeding Unicorn Edition Data...");

  // 1. CLEANUP (Order matters for foreign keys)
  await prisma.appointment.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.user.deleteMany(); // Clear users so we can re-seed roles
  await prisma.clinic.deleteMany();

  // 2. PASSWORD HASHING
  const password = await bcrypt.hash("admin123", 10);

  // 3. CLINICS
  const maxHospital = await prisma.clinic.create({
    data: {
      name: "Max Super Speciality",
      address: "Mussoorie Diversion Rd, Dehradun",
      image:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
      description:
        "A world-class healthcare facility offering advanced medical services, 24/7 emergency care, and robotic surgery options.",
      rating: 4.8,
    },
  });

  const aiims = await prisma.clinic.create({
    data: {
      name: "AIIMS Rishikesh",
      address: "Virbhadra Road, Rishikesh",
      image:
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80",
      description:
        "Premier government medical institute providing comprehensive research-based healthcare.",
      rating: 4.9,
    },
  });

  // 4. DOCTOR PROFILES (Public Display)
  await prisma.doctorProfile.createMany({
    data: [
      {
        name: "Dr. Trafalgar Law",
        specialty: "Heart Surgeon",
        experience: 12,
        price: 1500,
        rating: 4.9,
        image:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
        about:
          "Senior Cardiologist specializing in minimally invasive heart procedures.",
        clinicId: maxHospital.id,
      },
      {
        name: "Dr. Chopper",
        specialty: "Pediatrician",
        experience: 5,
        price: 800,
        rating: 5.0,
        image:
          "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
        about:
          "Loved by kids, trusted by parents. Specialist in early child development.",
        clinicId: maxHospital.id,
      },
      {
        name: "Dr. Strange",
        specialty: "Neurologist",
        experience: 15,
        price: 2500,
        rating: 4.7,
        image:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
        about: "Expert in neuro-critical care and spinal disorders.",
        clinicId: aiims.id,
      },
    ],
  });

  // 5. USERS (RBAC ROLES FOR LOGIN) 🦄
  // These are the accounts you will use to log into the Admin & Pro Apps
  await prisma.user.createMany({
    data: [
      // SUPER ADMIN (Web Admin Access)
      {
        name: "Pratham (Super Admin)",
        email: "admin@queue.com",
        password: password,
        role: Role.SUPER_ADMIN,
        phone: "9999999999",
      },
      // HOSPITAL ADMIN (Max Hospital Owner)
      {
        name: "Director of Max",
        email: "director@max.com",
        password: password,
        role: Role.HOSPITAL_ADMIN,
        clinicId: maxHospital.id,
        phone: "9876543210",
      },
      // DOCTOR (Queue Pro - Prescription Access)
      {
        name: "Dr. Law (User)",
        email: "law@max.com",
        password: password,
        role: Role.DOCTOR,
        clinicId: maxHospital.id,
        phone: "1122334455",
      },
      // PHARMACIST (Queue Pro - Medicine Access)
      {
        name: "Max Pharmacy Head",
        email: "pharma@max.com",
        password: password,
        role: Role.PHARMACIST,
        clinicId: maxHospital.id,
        phone: "5566778899",
      },
      // STAFF/PEON (Queue Pro - Queue Management Only)
      {
        name: "Ramesh (Staff)",
        email: "staff@max.com",
        password: password,
        role: Role.STAFF,
        clinicId: maxHospital.id,
        phone: "6677889900",
      },
    ],
  });

  console.log(`
  ✨ Unicorn Data Seeded Successfully!
  ------------------------------------
  🏥 Clinics: 2 Created
  👨‍⚕️ Doctors: 3 Profiles Created
  🔐 Users:   5 Roles Created (Password: admin123)
     - Super Admin: admin@queue.com
     - Hospital Admin: director@max.com
     - Doctor: law@max.com
     - Pharmacist: pharma@max.com
     - Staff: staff@max.com
  ------------------------------------
  `);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
