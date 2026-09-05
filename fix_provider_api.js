const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/navigation/CustomTabBar.tsx';
let code = fs.readFileSync(file, 'utf8');

const pauseRegex = /const performPause = async \(reason: string\) => \{[\s\S]*?\}\s*\};\s*const performResume = async \(\) => \{[\s\S]*?\}\s*\};/;

const newLogic = `const performPause = async (reason: string) => {
                  try {
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: true }
                    });
                    const { api } = require("../../services/api");
                    await api.post(\`/queue/\${activeClinic.id}/toggle-pause\`, {
                      isPaused: true,
                      reason
                    });
                  } catch (err: any) {
                    console.error("Pause API Error:", err?.response?.data || err.message);
                    alert("Failed to toggle queue state");
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: false }
                    });
                  }
                };

                const performResume = async () => {
                  try {
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: false }
                    });
                    const { api } = require("../../services/api");
                    await api.post(\`/queue/\${activeClinic.id}/toggle-pause\`, {
                      isPaused: false,
                      reason: null
                    });
                  } catch (err: any) {
                    console.error("Resume API Error:", err?.response?.data || err.message);
                    alert("Failed to resume queue");
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: true }
                    });
                  }
                };`;

code = code.replace(pauseRegex, newLogic);
fs.writeFileSync(file, code);
