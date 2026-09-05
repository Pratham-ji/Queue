const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/controllers/queue.controller.ts';
let code = fs.readFileSync(file, 'utf8');

const newEndpoint = `
// ==========================================
// DEMO RESET (Wipe all patients for a clinic)
// ==========================================
export const demoReset = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.body;
    if (!clinicId) return res.status(400).json({ error: "clinicId required" });

    await prisma.patient.deleteMany({
      where: { clinicId }
    });

    const io = req.app.get("io");
    if (io) {
      io.to(clinicId).emit("queue_update", []);
      io.to(clinicId).emit("current_patient", null);
    }

    res.json({ success: true, message: "Demo data purged successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
`;

code = code + newEndpoint;
fs.writeFileSync(file, code);

const routeFile = '/Users/pratham/Projects/Queue/apps/backend/src/routes/queue.routes.ts';
let routeCode = fs.readFileSync(routeFile, 'utf8');

if (!routeCode.includes('demoReset')) {
  routeCode = routeCode.replace('import {', 'import {\n  demoReset,');
  routeCode = routeCode.replace('export default router;', 'router.post("/demo-reset", demoReset);\n\nexport default router;');
  fs.writeFileSync(routeFile, routeCode);
}
