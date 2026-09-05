const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /\/\/ Live Tracker State[\s\S]*?const styles = StyleSheet\.create\(\{/;
const newTracker = `// Live Tracker State

  if (isMyTurn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Animatable.View animation="zoomIn" duration={500} style={styles.heroStateContainer}>
            <View style={styles.heroIconCircle}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="checkmark" size={48} color="#10B981" />
              </View>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.8)', marginTop: 24 }}>
              IT'S YOUR TURN
            </Text>
            <Text style={{ fontSize: 56, fontWeight: '900', color: '#FFFFFF', marginTop: 8 }}>
              Token #{activeToken}
            </Text>
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 16 }}>
              Please proceed to the doctor's cabin immediately.
            </Text>
          </Animatable.View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 32, width: '100%', gap: 12 }}>
          <TouchableOpacity style={[styles.ghostBtn, { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0", borderWidth: 1 }]}>
            <Ionicons name="call-outline" size={20} color={COLORS.textMain} />
            <Text style={[styles.ghostBtnText, { color: COLORS.textMain }]}>Contact Reception</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 8, alignItems: "center", paddingVertical: 12 }} onPress={() => {
            Alert.alert("Cancel Visit?", "Are you sure you want to cancel your visit?", [
              { text: "No", style: "cancel" },
              { text: "Yes, Cancel", style: "destructive", onPress: async () => {
                await leaveQueue();
                navigation.navigate("Home");
              }}
            ]);
          }}>
            <Text style={{ color: "#94A3B8", fontSize: 14, fontWeight: "600" }}>Cancel Visit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
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

        {/* QUEUE PROGRESS */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.stepperContainer}>
          <Text style={styles.sectionTitle}>Queue Progress</Text>
          
          <View style={styles.stepperItem}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepDotActive}>
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </View>
              <View style={styles.stepLineActive} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitleActive}>Checked In</Text>
              <Text style={styles.stepSub}>Your spot is confirmed</Text>
            </View>
          </View>

          <View style={styles.stepperItem}>
            <View style={styles.stepIndicator}>
              <Animatable.View animation="pulse" iterationCount="infinite" style={styles.stepDotPulse}>
                <View style={styles.stepDotInner} />
              </Animatable.View>
              <View style={styles.stepLineInactive} />
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
        </Animatable.View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.ghostBtn, { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0", borderWidth: 1 }]}>
            <Ionicons name="call-outline" size={20} color={COLORS.textMain} />
            <Text style={[styles.ghostBtnText, { color: COLORS.textMain }]}>Contact Reception</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.ghostBtn, { backgroundColor: "#FEF2F2", borderColor: "#FECACA", borderWidth: 1 }]} onPress={() => {
            Alert.alert("Leave Queue?", "Are you sure you want to abandon your spot?", [
              { text: "Cancel", style: "cancel" },
              { text: "Leave", style: "destructive", onPress: async () => {
                await leaveQueue();
                navigation.navigate("Home");
              }}
            ]);
          }}>
            <Ionicons name="exit-outline" size={20} color="#EF4444" />
            <Text style={[styles.ghostBtnText, { color: "#EF4444" }]}>Leave Queue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({`;

code = code.replace(regex, newTracker);
fs.writeFileSync(file, code);
