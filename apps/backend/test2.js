const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const clinics = await prisma.clinic.findMany();
  console.log("Clinics:");
  clinics.forEach(c => console.log(c.id, c.name));
  
  const patients = await prisma.patient.findMany();
  console.log("Patients:");
  patients.forEach(p => console.log(p.id, p.name, p.status, p.clinicId));
  
  const clinicMembers = await prisma.clinicMember.findMany();
  console.log("ClinicMembers:");
  clinicMembers.forEach(cm => console.log(cm.userId, cm.clinicId, cm.role));

  process.exit(0);
}
run();
