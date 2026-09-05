const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

// Ensure api is imported
if (!code.includes("import { api }")) {
  code = code.replace(
    /import \{ useUserQueueStore \} from "\.\.\/\.\.\/store\/userQueueStore";/m,
    `import { useUserQueueStore } from "../../store/userQueueStore";\nimport { api } from "../../services/api";\nimport AsyncStorage from "@react-native-async-storage/async-storage";`
  );
}

// Add local loading state
code = code.replace(
  /const \[name, setName\] = useState\(""\);/m,
  `const [name, setName] = useState("");\n  const [localIsLoading, setLocalIsLoading] = useState(false);`
);

// Add the direct join function
const directJoinLogic = `
  const handleTakeMySpot = async () => {
    if (!name.trim()) return Alert.alert("Required", "Please enter your name");
    
    setLocalIsLoading(true);
    try {
      // Direct API call as requested
      const payload = { clinicId: routeClinicId || activeClinicId, patientName: name };
      console.log('JOIN QUEUE PAYLOAD:', payload);
      
      // We hit the public add endpoint because /join requires auth
      const res = await api.post(\`/queue/\${payload.clinicId}/add\`, { 
        name: payload.patientName, 
        phone: "0000000000" 
      });

      if (res.data.success) {
        const token = res.data.data.token;
        // Hydrate store so the UI flips instantly
        useUserQueueStore.setState({ 
          activeToken: token, 
          queueStatus: "JOINED",
          activeClinicId: payload.clinicId 
        });
        await AsyncStorage.setItem("user_token", token.toString());
        await AsyncStorage.setItem("user_clinic_id", payload.clinicId);
        
        // Initialize socket for live tracking
        useUserQueueStore.getState().initializeSocket();
        useUserQueueStore.getState().refreshData();
      }
    } catch (error: any) {
      console.error("Direct Join Failed:", error);
      Alert.alert("Error Joining", error?.response?.data?.error || error?.response?.data?.message || error.message);
    } finally {
      setLocalIsLoading(false);
    }
  };
`;

if (!code.includes("handleTakeMySpot")) {
  code = code.replace(
    /if \(queueStatus !== "JOINED"\) \{/m,
    directJoinLogic + "\n  if (queueStatus !== \"JOINED\") {"
  );
}

// Update the button
code = code.replace(
  /onPress=\{.*?joinQueue.*?\}[\s\S]*?disabled=\{.*?isLoading\}/m,
  `onPress={handleTakeMySpot}\n              disabled={!name.trim() || localIsLoading}`
);

code = code.replace(
  /\{isLoading \? <ActivityIndicator color="#FFF" \/> : <Text style=\{styles.joinText\}>Take My Spot<\/Text>\}/m,
  `{localIsLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.joinText}>Take My Spot</Text>}`
);

fs.writeFileSync(file, code);
