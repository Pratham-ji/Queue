const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/navigation/CustomTabBar.tsx';
let code = fs.readFileSync(file, 'utf8');

// We will overwrite the entire route.name === "Emergency" block
const newBlock = `
            if (route.name === "Emergency") {
              const handleEmergency = () => {
                if (!activeClinic?.id) return;
                
                const performPause = async (reason: string) => {
                  try {
                    // Optimistic update
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: true }
                    });
                    
                    const { api } = require("../../services/api");
                    await api.post(\`/queue/\${activeClinic.id}/toggle-pause\`, {
                      isPaused: true,
                      reason
                    });
                  } catch (err) {
                    alert("Failed to toggle queue state");
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: false }
                    });
                  }
                };

                const performResume = async () => {
                  try {
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: false }
                    });
                    
                    const { api } = require("../../services/api");
                    // Hits the new endpoint requested
                    await api.post(\`/queue/\${activeClinic.id}/resume\`, {});
                  } catch (err) {
                    alert("Failed to resume queue");
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: true }
                    });
                  }
                };

                const { ActionSheetIOS, Platform, Alert } = require("react-native");
                if (Platform.OS === "ios") {
                  ActionSheetIOS.showActionSheetWithOptions(
                    {
                      options: ["Cancel", "🚨 Emergency (Pause Queue)", "☕ Doctor on Break", "▶️ End Break / Resume Queue"],
                      cancelButtonIndex: 0,
                      title: "Clinic Actions",
                      message: "Manage queue lifecycle",
                    },
                    (buttonIndex: number) => {
                      if (buttonIndex === 1) performPause("EMERGENCY");
                      if (buttonIndex === 2) performPause("BREAK");
                      if (buttonIndex === 3) performResume();
                    }
                  );
                } else {
                  Alert.alert(
                    "Clinic Actions",
                    "Manage queue lifecycle",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "🚨 Emergency (Pause Queue)", onPress: () => performPause("EMERGENCY") },
                      { text: "☕ Doctor on Break", onPress: () => performPause("BREAK") },
                      { text: "▶️ End Break / Resume Queue", onPress: () => performResume() },
                    ]
                  );
                }
              };

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={handleEmergency}
                  style={[
                    styles.premiumButton, 
                    isPaused ? { backgroundColor: "#EF4444", shadowColor: "#EF4444" } : { backgroundColor: COLORS.primary, shadowColor: COLORS.primary }
                  ]}
                >
                  <Text style={styles.premiumText}>{isPaused ? "Paused 🚨" : "Actions ⚡"}</Text>
                </TouchableOpacity>
              );
            }
`;

code = code.replace(
  /if \(route\.name === "Emergency"\) \{[\s\S]*?return \([\s\S]*?<\/TouchableOpacity>\);\n            \}/m,
  newBlock.trim()
);

fs.writeFileSync(file, code);
