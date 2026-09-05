const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

// The duplicate starts exactly at:
// `              <View style={styles.stepLineInactive} />`
// And ends at:
// `        </Animatable.View>` right above `{/* ACTION BUTTONS */}`

const chunkToRemove = `              <View style={styles.stepLineInactive} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitleActive}>Waiting for Turn</Text>
              <Text style={styles.stepSub}>
                {isEmergencyPause ? emergencyMessage === "EMERGENCY" ? "Doctor stepped out for an emergency." : "Doctor is on a short break." : 
                 currentServingToken ? \`Doctor is seeing Token #\${currentServingToken}\` : "Doctor is preparing..."}
              </Text>
            </View>
          </View>

          <View style={styles.stepperItem}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepDotInactive} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitleInactive}>Consultation</Text>
              <Text style={styles.stepSubInactive}>Head to the doctor's cabin when called</Text>
            </View>
          </View>
        </Animatable.View>`;

code = code.replace(chunkToRemove, '');

fs.writeFileSync(file, code);
