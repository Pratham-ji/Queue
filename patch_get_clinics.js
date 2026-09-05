const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/controllers/hospital.controller.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /include: \{ doctors: true \}/;
const replacement = 'include: { doctors: true, _count: { select: { patients: { where: { status: "WAITING" } } } } }';

code = code.replace(regex, replacement);
fs.writeFileSync(file, code);
