const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/navigation/CustomTabBar.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/require\("\.\.\/\.\.\/services\/api"\)/g, 'require("../services/api")');

fs.writeFileSync(file, code);
