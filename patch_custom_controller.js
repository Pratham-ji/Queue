const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/controllers/custom.controller.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /io\.to\(\`session_\$\{sessionId\}\`\)\.emit\("queue_updated_list", allParticipants\);[\s\S]*?io\.to\(\`session_\$\{sessionId\}\`\)\.emit\("queue_updated", updatedPerson\);/g;
code = code.replace(
  regex,
  `// Emit the full list for reliable sync
    io.to(sessionId).emit("custom_queue_updated", allParticipants);`
);

fs.writeFileSync(file, code);
