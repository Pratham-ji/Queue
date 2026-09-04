const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/booking/BookingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("useUserQueueStore")) {
  code = code.replace(
    /import \{ api \} from "\.\.\/\.\.\/services\/api";/m,
    `import { api } from "../../services/api";\nimport { useUserQueueStore } from "../../store/userQueueStore";`
  );
}

code = code.replace(
  /await AsyncStorage.setItem\("user_clinic_id", doctor.clinicId\);/m,
  `await AsyncStorage.setItem("user_clinic_id", doctor.clinicId);
        
        useUserQueueStore.getState().setClinic(doctor.clinicId);
        useUserQueueStore.setState({ activeToken: res.data.data.token, queueStatus: "JOINED" });
        useUserQueueStore.getState().initializeSocket();
        useUserQueueStore.getState().refreshData();`
);

fs.writeFileSync(file, code);
