const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/hospital/HospitalDetailsScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('import { socket } from "../../services/socket";\n', '');

const useEffectRegex = /useEffect\(\(\) => \{[\s\S]*?\}, \[id\]\);/;
const newUseEffect = `useEffect(() => {
    api.get(\`/hospital/clinics/\${id}\`).then((res) => {
      if (res.data.success) setHospital(res.data.data);
    }).catch((err) => console.log(err));
  }, [id]);`;

code = code.replace(useEffectRegex, newUseEffect);

fs.writeFileSync(file, code);
