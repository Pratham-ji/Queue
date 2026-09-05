const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/navigation/CustomTabBar.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /const \{ ActionSheetIOS, Platform, Alert \} = require\("react-native"\);[\s\S]*?\} else \{\s*Alert\.alert\([\s\S]*?\);\s*\}\s*\}/;

const newBlock = `const { ActionSheetIOS, Platform, Alert } = require("react-native");

                if (Platform.OS === "ios") {
                  ActionSheetIOS.showActionSheetWithOptions(
                    {
                      options: [
                        "Cancel",
                        "🚨 Emergency (Pause Queue)",
                        "☕ Doctor on Break",
                        "▶️ End Break / Resume Queue"
                      ],
                      cancelButtonIndex: 0,
                      title: "Queue Management",
                      message: "Select an action for the queue",
                    },
                    (buttonIndex: number) => {
                      if (buttonIndex === 1) performPause("EMERGENCY");
                      if (buttonIndex === 2) performPause("BREAK");
                      if (buttonIndex === 3) performResume();
                    }
                  );
                } else {
                  Alert.alert(
                    "Queue Management",
                    "Select an action for the queue",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "🚨 Emergency (Pause Queue)", onPress: () => performPause("EMERGENCY") },
                      { text: "☕ Doctor on Break", onPress: () => performPause("BREAK") },
                      { text: "▶️ End Break / Resume Queue", onPress: () => performResume() },
                    ]
                  );
                }`;

code = code.replace(regex, newBlock);
fs.writeFileSync(file, code);
