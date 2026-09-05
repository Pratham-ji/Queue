const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/app.ts';
let code = fs.readFileSync(file, 'utf8');

const badCode = "app.use('*', (req, res) => {";
const goodCode = "app.use((req: express.Request, res: express.Response) => {";

code = code.replace(badCode, goodCode);

fs.writeFileSync(file, code);
