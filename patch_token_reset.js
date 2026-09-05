const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/controllers/queue.controller.ts';
let code = fs.readFileSync(file, 'utf8');

// The user asked to use `todaysCount` and `tokenNumber`
code = code.replace(/const todayCount = await tx\.patient\.count/g, 'const todaysCount = await tx.patient.count');
code = code.replace(/const token = todayCount \+ 1;/g, 'const tokenNumber = todaysCount + 1;');
code = code.replace(/token,\n\s*status: "WAITING",/g, 'token: tokenNumber,\n          status: "WAITING",');

fs.writeFileSync(file, code);
