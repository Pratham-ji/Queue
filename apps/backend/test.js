const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({ where: { name: { contains: 'Anu', mode: 'insensitive' } } });
  console.log("Users:", users);
  const clinics = await prisma.clinic.findMany();
  console.log("Clinics:", clinics);
  const memberships = await prisma.clinicMember.findMany();
  console.log("Memberships:", memberships);
  process.exit(0);
}
run();
