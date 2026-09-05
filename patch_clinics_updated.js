const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/controllers/queue.controller.ts';
let code = fs.readFileSync(file, 'utf8');

// In togglePause:
code = code.replace(/io\.to\(clinicId\)\.emit\("queue_paused", \{ reason \}\);\n\s*\} else \{\n\s*io\.to\(clinicId\)\.emit\("queue_resumed"\);\n\s*\}/, (match) => {
  return match + '\n    io.emit("clinics_updated");';
});

// In resumeQueue:
code = code.replace(/io\.to\(clinicId\)\.emit\("queue_resumed"\);/, 'io.to(clinicId).emit("queue_resumed");\n      io.emit("clinics_updated");');

fs.writeFileSync(file, code);
