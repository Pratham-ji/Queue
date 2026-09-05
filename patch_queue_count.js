const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/controllers/queue.controller.ts';
let code = fs.readFileSync(file, 'utf8');

const todayLogic = `
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayCount = await tx.patient.count({
        where: { 
          clinicId: clinic.id,
          arrivalTime: { gte: startOfDay }
        },
      });
`;

code = code.replace(
  /const todayCount = await tx\.patient\.count\(\{\s*where: \{ clinicId: clinic\.id \},\s*\}\);/g,
  todayLogic
);

const joinTodayLogic = `
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayCount = await tx.patient.count({
        where: { 
          clinicId,
          arrivalTime: { gte: startOfDay }
        },
      });
`;

code = code.replace(
  /const todayCount = await tx\.patient\.count\(\{\s*where: \{ clinicId \},\s*\}\);/g,
  joinTodayLogic
);

fs.writeFileSync(file, code);
