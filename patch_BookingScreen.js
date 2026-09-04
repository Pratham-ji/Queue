const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/booking/BookingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /try {[\s\S]*?const res = await api.post\("\/queue\/join", \{[\s\S]*?\}\);/m,
  `try {
      const userStr = await AsyncStorage.getItem("user_data");
      const user = userStr ? JSON.parse(userStr) : { name: "Guest Patient" };
      
      const payload = {
        name: user.name,
        phone: user.phone || "0000000000",
        clinicId: doctor.clinicId,
      };
      console.log('JOIN QUEUE PAYLOAD:', payload);

      const res = await api.post(\`/queue/\${doctor.clinicId}/add\`, payload);`
);

code = code.replace(
  /catch \(error: any\) \{[\s\S]*?Alert.alert\("Error", "Network request failed. Check server logs."\);/m,
  `catch (error: any) {
      console.error("Booking Error:", error);
      Alert.alert("Booking Failed", error?.response?.data?.error || error?.response?.data?.message || error.message);`
);

fs.writeFileSync(file, code);
