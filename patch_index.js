const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/index.ts';
let code = fs.readFileSync(file, 'utf8');

// Remove the one I just appended at the bottom
code = code.replace(/\n\/\/ Global 404 Fallback[\s\S]*\}\);\n$/, '');

// Insert it right before "io.on("connection"" or before "const PORT"
code = code.replace('const PORT =', `// Global 404 Fallback - Prevent HTML crashes on undefined routes\napp.use('*', (req, res) => {\n  res.status(404).json({ success: false, message: 'API route not found' });\n});\n\nconst PORT =`);

fs.writeFileSync(file, code);
