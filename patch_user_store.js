const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/store/userQueueStore.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('queueStatus: "IDLE" | "JOINED";', 'queueStatus: "IDLE" | "JOINED" | "COMPLETED";');

// In refreshData:
const refreshDataRegex = /if \(myIndex === -1\) \{\s*\/\/ Not in waiting queue[\s\S]*?console\.log\("Failed to fetch prescription state"\);\s*\}\s*\}/;

const newRefreshData = `if (myIndex === -1 && current !== activeToken) {
            // Not in waiting queue and not currently serving. Check if completed.
            try {
              const statusRes = await api.get(\`/queue/patient/active?clinicId=\${activeClinicId}&token=\${activeToken}\`);
              if (statusRes.data.success && statusRes.data.data) {
                const pData = statusRes.data.data;
                if (pData.status === "COMPLETED") {
                  set({ queueStatus: "COMPLETED" });
                  // Optionally fetch prescription here if needed
                }
              } else {
                // Completely done or cancelled
                set({ queueStatus: "IDLE", activeToken: null, activePrescription: null });
                AsyncStorage.removeItem("active_token");
              }
            } catch (err) {
              console.log("Failed to fetch patient state");
            }
          }`;

code = code.replace(refreshDataRegex, newRefreshData);
fs.writeFileSync(file, code);
