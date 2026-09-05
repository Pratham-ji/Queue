const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/hospital/HospitalDetailsScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add socket imports if needed
if (!code.includes('import socket')) {
  code = code.replace('import { api } from "../../services/api";', 'import { api } from "../../services/api";\nimport { socket } from "../../services/socket";');
}

// Add socket listeners in useEffect
const useEffectRegex = /useEffect\(\(\) => \{[\s\S]*?api\.get\(\`\/hospital\/clinics\/\$\{id\}\`\)[\s\S]*?\}, \[id\]\);/;
const newUseEffect = `useEffect(() => {
    api.get(\`/hospital/clinics/\${id}\`).then((res) => {
      if (res.data.success) setHospital(res.data.data);
    }).catch((err) => console.log(err));

    socket.emit("join_clinic", id);

    const handlePaused = ({ reason }: { reason: string }) => {
      setHospital((prev: any) => prev ? { ...prev, isEmergencyPause: true, emergencyMessage: reason } : prev);
    };

    const handleResumed = () => {
      setHospital((prev: any) => prev ? { ...prev, isEmergencyPause: false, emergencyMessage: null } : prev);
    };

    socket.on("queue_paused", handlePaused);
    socket.on("queue_resumed", handleResumed);

    return () => {
      socket.off("queue_paused", handlePaused);
      socket.off("queue_resumed", handleResumed);
    };
  }, [id]);`;

code = code.replace(useEffectRegex, newUseEffect);

fs.writeFileSync(file, code);
