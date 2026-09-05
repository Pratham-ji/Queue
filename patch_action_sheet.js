const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/navigation/CustomTabBar.tsx';
let code = fs.readFileSync(file, 'utf8');

const newBlock = `
            // Premium Action Button (Far Right)
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
                    // Revert on error
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: false }
                    });
                  }
                };

                const performResume = async () => {
                  try {
                    // Optimistic UI for 0ms latency
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: false }
                    });
                    
                    const { api } = require("../../services/api");
                    await api.post(\`/queue/\${activeClinic.id}/resume\`, {});
                  } catch (err) {
                    alert("Failed to resume queue");
                    // Revert on error
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: true }
                    });
                  }
                };

                const { ActionSheetIOS, Platform, Alert } = require("react-native");

                if (isPaused) {
                  if (Platform.OS === "ios") {
                    ActionSheetIOS.showActionSheetWithOptions(
                      {
                        options: ["Cancel", "▶️ End Break / Resume Queue"],
                        cancelButtonIndex: 0,
                        title: "Clinic Paused",
                        message: "Ready to take patients again?",
                        destructiveButtonIndex: 1, // On iOS, destructive makes it red, but we want Royal Blue/Emerald. ActionSheetIOS doesn't easily support custom colors for standard buttons besides red via destructive. We'll use default.
                      },
                      (buttonIndex: number) => {
                        if (buttonIndex === 1) performResume();
                      }
                    );
                  } else {
                    Alert.alert(
                      "Clinic Paused",
                      "Ready to take patients again?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "▶️ End Break / Resume Queue", onPress: () => performResume() },
                      ]
                    );
                  }
                } else {
                  if (Platform.OS === "ios") {
                    ActionSheetIOS.showActionSheetWithOptions(
                      {
                        options: ["Cancel", "🚨 Emergency (Pause Queue)", "☕ Doctor on Break"],
                        cancelButtonIndex: 0,
                        title: "Pause Queue",
                        message: "Select a reason for pausing the queue",
                      },
                      (buttonIndex: number) => {
                        if (buttonIndex === 1) performPause("EMERGENCY");
                        if (buttonIndex === 2) performPause("BREAK");
                      }
                    );
                  } else {
                    Alert.alert(
                      "Pause Queue",
                      "Select a reason for pausing the queue",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "🚨 Emergency (Pause Queue)", onPress: () => performPause("EMERGENCY") },
                        { text: "☕ Doctor on Break", onPress: () => performPause("BREAK") },
                      ]
                    );
                  }
                }
              };

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={handleEmergency}
                  style={[styles.premiumButton, isPaused && { backgroundColor: "#EF4444", shadowColor: "#EF4444" }]}
                >
                  <Text style={styles.premiumText}>{isPaused ? "Paused 🚨" : "Pause Q 🚨"}</Text>
                </TouchableOpacity>
              );
            }
`;

// use regex to replace the old block
code = code.replace(/\/\/ Premium Action Button \(Far Right\)[\s\S]*?return \(\s*<AnimatedTabIcon/m, newBlock + "\n\n            // Normal Tabs\n            const getIconName = () => {\n              if (route.name === \"Desk\") return isFocused ? \"grid\" : \"grid-outline\";\n              if (route.name === \"Pharmacy\") return isFocused ? \"medical\" : \"medical-outline\";\n              if (route.name === \"History\") return isFocused ? \"time\" : \"time-outline\";\n              return \"ellipse\";\n            };\n\n            return (\n              <AnimatedTabIcon");

fs.writeFileSync(file, code);
