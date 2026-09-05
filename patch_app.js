const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/app.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('API route not found')) {
  code = code.replace('const PORT =', `// Global 404 Fallback - Prevent HTML crashes on undefined routes\napp.use('*', (req, res) => {\n  res.status(404).json({ success: false, message: 'API route not found' });\n});\n\nconst PORT =`);
  fs.writeFileSync(file, code);
}
