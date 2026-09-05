const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/routes/provider.routes.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('export default router;\nrouter.get("/history", requireAuth, getHistory);\n', 'router.get("/history", requireAuth, getHistory);\n\nexport default router;\n');
fs.writeFileSync(file, code);
