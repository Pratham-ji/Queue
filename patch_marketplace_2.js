const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/controllers/marketplace.controller.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /export const toggleOnlineStatus[\s\S]*?\n\};/g;

const rebuilt = `export const toggleOnlineStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { clinicId, isOnline } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!clinicId) return res.status(400).json({ error: "clinicId is required" });

    const membership = await prisma.clinicMember.findUnique({
      where: { userId_clinicId: { userId, clinicId } },
    });

    if (!membership || !["OWNER", "ADMIN", "DOCTOR"].includes(membership.role)) {
      return res.status(403).json({ error: "No permission" });
    }

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: { isOnline },
    });

    if (isOnline) {
      await prisma.patient.updateMany({
        where: {
          clinicId,
          status: { in: ["WAITING", "SERVING"] },
        },
        data: { status: "MISSED" },
      });
      
      const io = req.app.get("io");
      if (io) {
        io.to(clinicId).emit("queue_update", []);
      }
    }

    const io = req.app.get("io");
    if (io) {
      io.emit(\`clinic_online_\${clinicId}\`, { isOnline });
    }

    res.json({ success: true, data: clinic });
  } catch (error) {
    console.error("toggleOnline error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};`;

code = code.replace(/[\s\S]*?const clinic = await prisma.clinic.update\(\{[\s\S]*?data: \{ isOnline \},\n    \}\);[\s\S]*?\n\};/m, rebuilt);
// Actually, since the regex might fail because it's truncated, let's just use string replace carefully

