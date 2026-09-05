const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/backend/src/controllers/marketplace.controller.ts';
let code = fs.readFileSync(file, 'utf8');

// I need to completely replace everything from 'export const toggleEmergency' to the end of the file.
const newEnding = `export const toggleEmergency = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { clinicId, isEmergencyPause, emergencyMessage } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!clinicId) return res.status(400).json({ error: "clinicId is required" });

    // Verify user is an ADMIN or OWNER of the clinic
    const membership = await prisma.clinicMember.findUnique({
      where: { userId_clinicId: { userId, clinicId } },
    });

    if (!membership || !["OWNER", "ADMIN", "DOCTOR"].includes(membership.role)) {
      return res.status(403).json({ error: "You don't have permission to toggle emergency status" });
    }

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: { isEmergencyPause, emergencyMessage },
    });

    const io = req.app.get("io");
    if (io) {
      if (isEmergencyPause) {
         io.to(clinicId).emit("queue_paused", { reason: "EMERGENCY" });
      } else {
         io.to(clinicId).emit("queue_resumed");
      }
    }

    res.json({ success: true, data: clinic });
  } catch (error) {
    console.error("toggleEmergency error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const toggleOnlineStatus = async (req: AuthRequest, res: Response) => {
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

code = code.substring(0, code.indexOf('export const toggleEmergency'));
code += newEnding;

fs.writeFileSync(file, code);
