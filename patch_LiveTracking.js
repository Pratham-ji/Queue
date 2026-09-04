const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/queue/LiveTrackingScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const \{\s*queueStatus,\s*activeToken,\s*activeClinicId,\s*joinQueue,/m,
  `const {
    queueStatus,
    activeToken,
    activeClinicId,
    joinQueue,
    setClinic,`
);

code = code.replace(
  /const clinicName = route\?\.params\?\.clinicName \|\| "General Department";/m,
  `const clinicName = route?.params?.clinicName || "General Department";
  const routeClinicId = route?.params?.clinicId;

  useEffect(() => {
    if (routeClinicId && routeClinicId !== activeClinicId) {
      setClinic(routeClinicId);
    }
  }, [routeClinicId]);`
);

fs.writeFileSync(file, code);
