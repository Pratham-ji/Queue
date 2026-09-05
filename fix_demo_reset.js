const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/routes/queue.routes.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('demoReset, Router } from "express";', 'Router } from "express";');
code = code.replace('getQueue,', 'getQueue,\n  demoReset,');

fs.writeFileSync(file, code);
