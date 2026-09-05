const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const regexIdle = /if \(queueStatus !== "JOINED"\) \{/;
code = code.replace(regexIdle, 'if (queueStatus === "IDLE") {');

const regexCompleted = /if \(queueStatus === "IDLE"\) \{[\s\S]*?return \([\s\S]*?\}\s*\}\n\n  \/\/ Live Tracker State/;
const newCompleted = `if (queueStatus === "COMPLETED") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Animatable.View animation="bounceIn" style={{ alignItems: "center", backgroundColor: "#ECFDF5", padding: 32, borderRadius: 24 }}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#065F46", marginTop: 16, textAlign: "center" }}>Consultation Complete</Text>
            <Text style={{ fontSize: 16, color: "#047857", marginTop: 8, textAlign: "center", lineHeight: 24 }}>
              Your session has ended. Thank you for visiting {clinicName}!
            </Text>
            <TouchableOpacity 
              style={{ marginTop: 32, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, backgroundColor: "#059669" }}
              onPress={() => {
                useUserQueueStore.setState({ queueStatus: "IDLE", activeToken: null });
                navigation.navigate("Home");
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>Return to Home</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </SafeAreaView>
    );
  }

  // Live Tracker State`;

code = code.replace('// Live Tracker State', newCompleted);

fs.writeFileSync(file, code);
