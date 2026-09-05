const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the duplicate stepper chunk that was left over
const badRegex = /\}\)\}\s*<View style=\{styles\.stepLineInactive\} \/>[\s\S]*?<\/Animatable\.View>/;
code = code.replace(badRegex, ')}');

fs.writeFileSync(file, code);
