const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const trackerRegex = /\{\/\* HERO TRACKER \*\/\}[\s\S]*?\{\/\* PROGRESS OR HERO STATE \*\/\}[\s\S]*?\{isMyTurn \? \([\s\S]*?<\/Animatable\.View>\n\s*\) : \(/;

const newUI = `{/* MAIN CONTENT */}
        {isMyTurn ? (
          <Animatable.View animation="zoomIn" duration={500} style={[styles.heroStateContainer, { paddingVertical: 48 }]}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="checkmark-circle" size={100} color="#FFFFFF" />
            </View>
            <Text style={[styles.heroTitle, { fontSize: 32 }]}>Your Token #{activeToken}</Text>
            <Text style={[styles.heroTitle, { marginTop: -8 }]}>It's Your Turn!</Text>
            <Text style={[styles.heroSubtitle, { marginTop: 8, fontSize: 18 }]}>
              Please proceed to the doctor's cabin immediately.
            </Text>
          </Animatable.View>
        ) : (
          <>
            {/* HERO TRACKER */}
            <Animatable.View animation="fadeInDown" duration={600} style={styles.heroCard}>
              <Text style={styles.hospitalName}>{clinicName}</Text>
              
              {isEmergencyPause ? (
                <View style={[styles.waitPill, emergencyMessage === "EMERGENCY" ? { backgroundColor: "#FEF2F2" } : { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="warning" size={14} color={emergencyMessage === "EMERGENCY" ? "#EF4444" : "#F59E0B"} style={{ marginRight: 6 }} />
                  <Text style={[styles.waitText, emergencyMessage === "EMERGENCY" ? { color: "#B91C1C" } : { color: "#92400E" }]}>
                    {emergencyMessage === "EMERGENCY" ? "Paused (Emergency)" : "Paused (Doctor on Break)"}
                  </Text>
                </View>
              ) : (
                <View style={styles.waitPill}>
                  <Ionicons name="time" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.waitText}>Est. Wait: {estimatedWait} mins</Text>
                </View>
              )}

              <Text style={styles.tokenLabel}>YOUR TOKEN</Text>
              <Text style={styles.tokenNumber}>#{activeToken}</Text>

              <View style={styles.metricRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>#{currentServingToken || "--"}</Text>
                  <Text style={styles.metricLabel}>Current Token</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{peopleAhead}</Text>
                  <Text style={styles.metricLabel}>People Ahead</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricBox}>
                  <Text style={[styles.metricValue, { color: isEmergencyPause ? (emergencyMessage === "EMERGENCY" ? "#EF4444" : "#F59E0B") : COLORS.primary, fontSize: 14 }]}>
                    {isEmergencyPause ? "PAUSED" : (peopleAhead === 0 ? "NEXT" : "ON TIME")}
                  </Text>
                  <Text style={styles.metricLabel}>Status</Text>
                </View>
              </View>
            </Animatable.View>

            {/* QUEUE PROGRESS */}`;

code = code.replace(trackerRegex, newUI);

// Fix the closing tags at the bottom of the Stepper
const endRegex = /<\/View>\n\s*<\/Animatable\.View>\n\s*\)/;
code = code.replace(endRegex, '</View>\n          </Animatable.View>\n          </>\n        )');

fs.writeFileSync(file, code);
