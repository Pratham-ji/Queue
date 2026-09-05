const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /heroStateContainer: \{[\s\S]*?elevation: 10,\n\s*\}/;
const newStyles = `heroStateContainer: {
    backgroundColor: "#10B981",
    borderRadius: 32,
    paddingVertical: 48,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  }`;
code = code.replace(regex, newStyles);

fs.writeFileSync(file, code);
