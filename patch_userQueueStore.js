const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/store/userQueueStore.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /joinQueue: async \(name, phone\) => {[\s\S]*?finally {/m,
  `joinQueue: async (name, phone) => {
    const { activeClinicId, expoPushToken } = get();
    if (!name || !activeClinicId) return;

    set({ isLoading: true });
    try {
      const payload = { name, phone, expoPushToken };
      console.log('JOIN QUEUE PAYLOAD:', payload);
      const res = await api.post(\`/queue/\${activeClinicId}/add\`, payload);

      if (res.data.success) {
        const token = res.data.data.token;
        set({ activeToken: token, queueStatus: "JOINED" });
        await AsyncStorage.setItem("user_token", token.toString());
        await AsyncStorage.setItem("user_clinic_id", activeClinicId);
        get().initializeSocket();
        get().refreshData();
      }
    } catch (error: any) {
      console.error("Join Failed:", error);
      import("react-native").then(({ Alert }) => {
        Alert.alert("Booking Failed", error?.response?.data?.error || error?.response?.data?.message || error.message);
      });
    } finally {`
);
fs.writeFileSync(file, code);
