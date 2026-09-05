const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/routes/queue.routes.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("resumeQueue")) {
  code = code.replace(
    /togglePause,\n} from "\.\.\/controllers\/queue\.controller";/m,
    `togglePause,\n  resumeQueue,\n} from "../controllers/queue.controller";`
  );

  code = code.replace(
    /router\.post\("\/:clinicId\/toggle-pause", togglePause\);/m,
    `router.post("/:clinicId/toggle-pause", togglePause);\n// 7. Resume\nrouter.post("/:clinicId/resume", resumeQueue);`
  );
  fs.writeFileSync(file, code);
}
