const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/navigation/CustomTabBar.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /<TouchableOpacity[\s\S]*?<Text style=\{styles.premiumText\}>\{isPaused \? "Paused 🚨" : "Pause Q 🚨"\}<\/Text>[\s\S]*?<\/TouchableOpacity>/;

const newBtn = `<TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={handleEmergency}
                  style={[styles.premiumButton, isPaused && { backgroundColor: "#10B981", shadowColor: "#10B981" }]}
                >
                  <Text style={styles.premiumText}>{isPaused ? "Resume ▶️" : "Pause Q 🚨"}</Text>
                </TouchableOpacity>`;

code = code.replace(regex, newBtn);
fs.writeFileSync(file, code);
