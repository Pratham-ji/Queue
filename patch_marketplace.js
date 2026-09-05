const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/controllers/marketplace.controller.ts';
let code = fs.readFileSync(file, 'utf8');

const replacement = `
    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: { isOnline },
    });

    if (isOnline) {
      await prisma.patient.updateMany({
        where: {
          clinicId,
          status: { in: ["WAITING", "SERVING"] },
        },
        data: { status: "MISSED" },
      });
      
      const io = req.app.get("io");
      if (io) {
        io.to(clinicId).emit("queue_update", []);
      }
    }
`;

code = code.replace(
  /const clinic = await prisma\.clinic\.update\(\{[\s\S]*?data: \{ isOnline \},\n    \}\);/m,
  replacement
);

fs.writeFileSync(file, code);
