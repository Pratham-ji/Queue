const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/routes/hospital.routes.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /import express from "express";\n  getClinics,/m,
  `import express from "express";\nimport {\n  getClinics,`
);

fs.writeFileSync(file, code);
