const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/routes/queue.routes.ts';
let code = fs.readFileSync(file, 'utf8');

// Remove getActivePatientStatus from the express import
code = code.replace(/import \{\s*getActivePatientStatus,\s*Router\s*\} from "express";/, 'import { Router } from "express";');

// Add getActivePatientStatus to the controller import
code = code.replace(/import \{\s*getQueue,/m, 'import {\n  getActivePatientStatus,\n  getQueue,');

fs.writeFileSync(file, code);
