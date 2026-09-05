const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/create/CustomSessionScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const newRenderItem = `            renderItem={({ item }) => {
              const isServing = item.status === "SERVING";
              const isCompleted = item.status === "COMPLETED";
              const isWaiting = item.status === "WAITING";
              
              const Wrapper = isServing ? Animatable.View : View;
              
              return (
                <Wrapper
                  animation={isServing ? "pulse" : undefined}
                  iterationCount={isServing ? "infinite" : undefined}
                  duration={2000}
                  style={[
                    styles.row,
                    isServing && { borderWidth: 2, borderColor: "#10B981", backgroundColor: "#ECFDF5" },
                    isCompleted && { opacity: 0.5 },
                  ]}
                >
                  <View
                    style={[
                      styles.tokenCircle,
                      isServing && styles.activeToken,
                      isCompleted && { backgroundColor: "#E2E8F0" }
                    ]}
                  >
                    <Text
                      style={[
                        styles.tokenNum,
                        isServing && { color: "#FFF" },
                      ]}
                    >
                      {item.token}
                    </Text>
                  </View>
                  <Text style={[
                    styles.name,
                    isCompleted && { textDecorationLine: "line-through", color: "#94A3B8" }
                  ]}>{item.name}</Text>

                  {/* STATUS BADGE */}
                  <View
                    style={[
                      styles.statusPill,
                      isServing && { backgroundColor: "#10B981" },
                      isWaiting && { backgroundColor: "#F1F5F9" },
                      isCompleted && { backgroundColor: "#E2E8F0" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isServing && { color: "#FFFFFF" },
                        isWaiting && { color: "#64748B" },
                        isCompleted && { color: "#94A3B8" },
                      ]}
                    >
                      {isServing ? "NOW SERVING" : isCompleted ? "DONE" : "WAITING"}
                    </Text>
                  </View>
                </Wrapper>
              );
            }}`;

code = code.replace(/renderItem=\{[\s\S]*?\}\n\s*\/>/m, newRenderItem + "\n          />");

// Ensure Animatable is imported
if (!code.includes("react-native-animatable")) {
  code = code.replace(/import \{ Ionicons \} from "@expo\/vector-icons";/m, 'import { Ionicons } from "@expo/vector-icons";\nimport * as Animatable from "react-native-animatable";');
}

fs.writeFileSync(file, code);
