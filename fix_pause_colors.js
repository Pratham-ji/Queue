const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldPill = /\{isEmergencyPause \? \([\s\S]*?\) : \(/;
const newPill = `{isEmergencyPause ? (
            <View style={[styles.waitPill, emergencyMessage === "EMERGENCY" ? { backgroundColor: "#FEF2F2" } : { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="warning" size={14} color={emergencyMessage === "EMERGENCY" ? "#EF4444" : "#F59E0B"} style={{ marginRight: 6 }} />
              <Text style={[styles.waitText, emergencyMessage === "EMERGENCY" ? { color: "#B91C1C" } : { color: "#92400E" }]}>
                {emergencyMessage === "EMERGENCY" ? "Paused (Emergency)" : "Paused (Doctor on Break)"}
              </Text>
            </View>
          ) : (`;

code = code.replace(oldPill, newPill);
fs.writeFileSync(file, code);
