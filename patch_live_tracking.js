const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const isMyTurnCheck = `
  const isMyTurn = activeToken && currentServingToken && Number(activeToken) === Number(currentServingToken);
  
  React.useEffect(() => {
    if (isMyTurn) {
      const { Vibration } = require('react-native');
      Vibration.vibrate([0, 500, 200, 500]);
    }
  }, [isMyTurn]);
`;

// Inject isMyTurn logic after `const [localIsLoading, setLocalIsLoading] = useState(false);`
code = code.replace('const [localIsLoading, setLocalIsLoading] = useState(false);', 'const [localIsLoading, setLocalIsLoading] = useState(false);\n' + isMyTurnCheck);

// Replace the Vertical Progress Stepper block with the conditional logic
const stepperRegex = /\{\/\* VERTICAL PROGRESS STEPPER \*\/\}[\s\S]*?<\/Animatable\.View>/;

const newUI = `{/* PROGRESS OR HERO STATE */}
        {isMyTurn ? (
          <Animatable.View animation="zoomIn" duration={500} style={styles.heroStateContainer}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>It's Your Turn!</Text>
            <Text style={styles.heroSubtitle}>
              Please proceed to the doctor's cabin immediately. Token #{currentServingToken} is now serving.
            </Text>
          </Animatable.View>
        ) : (
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
        )}`;

code = code.replace(stepperRegex, newUI);

// Add styles for heroStateContainer
const stylesInsert = `
  heroStateContainer: {
    backgroundColor: "#10B981", // Vibrant Emerald
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroIconCircle: {
    marginBottom: 16,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 12,
    textAlign: "center",
  },
  heroSubtitle: {
    color: "#ECFDF5",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
  },
`;

code = code.replace('const styles = StyleSheet.create({', 'const styles = StyleSheet.create({\n' + stylesInsert);

fs.writeFileSync(file, code);
