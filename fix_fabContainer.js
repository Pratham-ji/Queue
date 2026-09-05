const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/screens/dashboard/DashboardScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/fabContainer: \{ marginTop: 16, marginBottom: 16   marginHorizontal: 24,\n  \},/, 'fabContainer: { marginHorizontal: 24 },');

fs.writeFileSync(file, code);
