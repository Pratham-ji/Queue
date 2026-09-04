const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const verified = await prisma.clinic.findMany({ where: { verified: true } });
  console.log("Verified clinics:", verified.length);
  if (verified.length > 0) console.log(verified[0].name);
}
main().catch(console.error).finally(() => prisma.$disconnect());
