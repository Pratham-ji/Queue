const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/navigation/CustomTabBar.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /\} else \{\s*if \(Platform\.OS === "ios"\) \{\s*ActionSheetIOS\.showActionSheetWithOptions\([\s\S]*?\}\s*\n\s*\};/;

code = code.replace(regex, '};\n');
fs.writeFileSync(file, code);
