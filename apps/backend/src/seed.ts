import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// 1. Load Environment Variables
dotenv.config();

// 2. Initialize Client with Explicit URL
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create the Doctor
  const user = await prisma.user.create({
    data: {
      email: "law@heartpirates.com",
      password: "securepassword", // In a real app, hash this!
      name: "Dr. Trafalgar Law",
      clinic: {
        create: { name: "Heart Pirates Clinic" },
      },
    },
  });

  console.log("✅ Seeded doctor:", user.name);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
