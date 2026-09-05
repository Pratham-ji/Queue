const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const actionsRegex = /\{\/\* ACTION BUTTONS \*\/\}[\s\S]*?<\/View>/;
const newActions = `{/* ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.ghostBtn, { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0", borderWidth: 1 }]}>
            <Ionicons name="call-outline" size={20} color={COLORS.textMain} />
            <Text style={[styles.ghostBtnText, { color: COLORS.textMain }]}>Contact Reception</Text>
          </TouchableOpacity>

          {!isMyTurn ? (
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
          ) : (
            <TouchableOpacity style={{ marginTop: 16, alignItems: "center", paddingVertical: 12 }} onPress={() => {
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
          )}
        </View>`;

code = code.replace(actionsRegex, newActions);
fs.writeFileSync(file, code);
