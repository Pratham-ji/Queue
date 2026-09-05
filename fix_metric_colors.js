const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /\{ color: isEmergencyPause \? "#EF4444" : COLORS\.primary, fontSize: 14 \}\]>[\s\S]*?\{isEmergencyPause \? "PAUSED" : "LIVE"\}/;
const replacement = `{ color: isEmergencyPause ? (emergencyMessage === "EMERGENCY" ? "#EF4444" : "#F59E0B") : COLORS.primary, fontSize: 14 }]}>
                {isEmergencyPause ? "PAUSED" : "LIVE"}`;

code = code.replace(regex, replacement);
fs.writeFileSync(file, code);
