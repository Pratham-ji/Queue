const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/controllers/queue.controller.ts';
let code = fs.readFileSync(file, 'utf8');

const newCode = `
// ==========================================
// GET PATIENT ACTIVE STATUS
// ==========================================
export const getActivePatientStatus = async (req: Request, res: Response) => {
  try {
    const { clinicId, token } = req.query;
    if (!clinicId || !token) return res.status(400).json({ error: "Missing params" });

    // Look for the patient in this clinic with this token
    // Allow returning a COMPLETED ticket if completed within the last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const patient = await prisma.patient.findFirst({
      where: {
        clinicId: String(clinicId),
        token: parseInt(String(token)),
        OR: [
          { status: "WAITING" },
          { status: "SERVING" },
          { status: "COMPLETED", completedTime: { gte: twoHoursAgo } },
        ]
      },
      orderBy: { arrivalTime: "desc" }
    });

    if (!patient) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
`;
code += newCode;
fs.writeFileSync(file, code);

const routesFile = '/Users/pratham/Projects/Queue/apps/backend/src/routes/queue.routes.ts';
let routesCode = fs.readFileSync(routesFile, 'utf8');
routesCode = routesCode.replace('import {', 'import {\n  getActivePatientStatus,');
routesCode = routesCode.replace('export default router;', 'router.get("/patient/active", getActivePatientStatus);\n\nexport default router;');
fs.writeFileSync(routesFile, routesCode);
