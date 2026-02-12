import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("💎 Seeding Unicorn Edition Data...");

  await prisma.appointment.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.clinic.deleteMany();

  // 1. Clinics (Using ID-based Unsplash URLs for stability)
  const maxHospital = await prisma.clinic.create({
    data: {
      name: "Max Super Speciality",
      address: "Mussoorie Diversion Rd, Dehradun",
      image:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80", // Modern Hall
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
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80", // Clean White Hospital
      description:
        "Premier government medical institute providing comprehensive research-based healthcare.",
      rating: 4.9,
    },
  });

  // 2. Doctors (Professional Portraits)
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

  console.log("✨ Unicorn Data Seeded!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
