"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQueue = exports.createQueue = exports.joinQueue = exports.addPatient = exports.callNextPatient = exports.getQueue = void 0;
const client_1 = require("@prisma/client");
// Initialize the Database Client
const prisma = new client_1.PrismaClient();
// GET QUEUE (Read from Real Database)
const getQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clinicId = req.params.clinicId;
        // Fetch waiting patients from DB
        const queue = yield prisma.patient.findMany({
            where: {
                clinicId,
                status: "WAITING",
            },
            orderBy: { token: "asc" },
        });
        if (queue.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "Queue is empty",
            });
        }
        res.status(200).json({ success: true, data: queue });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});
exports.getQueue = getQueue;
// CALL NEXT PATIENT (Update Real Database)
const callNextPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clinic = yield prisma.clinic.findFirst();
        if (!clinic)
            return res.status(404).json({ message: "No clinic found" });
        // 1. Find the next person in line
        const nextPatient = yield prisma.patient.findFirst({
            where: { clinicId: clinic.id, status: "WAITING" },
            orderBy: { token: "asc" },
        });
        if (!nextPatient) {
            return res
                .status(400)
                .json({ success: false, message: "Queue is empty" });
        }
        // 2. Update their status to SERVING
        const served = yield prisma.patient.update({
            where: { id: nextPatient.id },
            data: {
                status: "SERVING",
                servedTime: new Date(),
            },
        });
        // 3. Notify Mobile App (Socket.io)
        // We send the *remaining* waiting list to update the screen
        const io = req.app.get("io");
        const remainingQueue = yield prisma.patient.findMany({
            where: { clinicId: clinic.id, status: "WAITING" },
            orderBy: { token: "asc" },
        });
        io.emit("queue_update", remainingQueue);
        res.status(200).json({ success: true, served });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error calling next" });
    }
});
exports.callNextPatient = callNextPatient;
// ADD PATIENT (Write to Real Database + Socket Emit)
const addPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone } = req.body;
        if (!name)
            return res.status(400).json({ error: "Name is required" });
        // 1. Find the clinic (In a real app, this comes from the logged-in user)
        const clinic = yield prisma.clinic.findFirst();
        if (!clinic)
            return res.status(404).json({ error: "Clinic not found" });
        // 2. Generate the next Token Number (Count current patients + 1)
        // We count *all* patients created today to make a unique token
        const todayCount = yield prisma.patient.count({
            where: { clinicId: clinic.id },
        });
        const token = todayCount + 1;
        // 3. Create the Patient in AWS
        const newPatient = yield prisma.patient.create({
            data: {
                name,
                phone: phone || "", // Phone is optional
                token,
                status: "WAITING",
                clinicId: clinic.id,
            },
        });
        // 4. REAL-TIME UPDATE: Tell everyone the queue changed
        const io = req.app.get("io");
        const updatedQueue = yield prisma.patient.findMany({
            where: { clinicId: clinic.id, status: "WAITING" },
            orderBy: { token: "asc" },
        });
        io.emit("queue_update", updatedQueue);
        res.status(201).json({ success: true, data: newPatient });
    }
    catch (error) {
        console.error("Error adding patient:", error);
        res.status(500).json({ success: false, error: "Failed to add patient" });
    }
});
exports.addPatient = addPatient;
// JOIN QUEUE - Allows a user to join a queue
const joinQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, phone, clinicId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!name || !clinicId) {
            return res.status(400).json({ error: "Name and clinicId are required" });
        }
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Check if clinic exists
        const clinic = yield prisma.clinic.findUnique({
            where: { id: clinicId },
        });
        if (!clinic) {
            return res.status(404).json({ error: "Clinic not found" });
        }
        // Generate token
        const todayCount = yield prisma.patient.count({
            where: { clinicId },
        });
        const token = todayCount + 1;
        // Create patient
        const newPatient = yield prisma.patient.create({
            data: {
                name,
                phone: phone || "",
                token,
                status: "WAITING",
                clinicId,
            },
        });
        // Emit real-time update
        const io = req.app.get("io");
        const updatedQueue = yield prisma.patient.findMany({
            where: { clinicId, status: "WAITING" },
            orderBy: { token: "asc" },
        });
        io.emit("queue_update", updatedQueue);
        res.status(201).json({ success: true, data: newPatient });
    }
    catch (error) {
        console.error("Error joining queue:", error);
        res.status(500).json({ success: false, error: "Failed to join queue" });
    }
});
exports.joinQueue = joinQueue;
// CREATE QUEUE - Provider creates a new clinic/queue
const createQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, address } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!name) {
            return res.status(400).json({ error: "Clinic name is required" });
        }
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Check if user already owns a clinic
        const existingClinic = yield prisma.clinic.findUnique({
            where: { ownerId: userId },
        });
        if (existingClinic) {
            return res.status(400).json({ error: "You already own a clinic" });
        }
        // Create new clinic
        const newClinic = yield prisma.clinic.create({
            data: {
                name,
                address: address || "",
                ownerId: userId,
            },
        });
        res.status(201).json({ success: true, data: newClinic });
    }
    catch (error) {
        console.error("Error creating queue:", error);
        res.status(500).json({ success: false, error: "Failed to create queue" });
    }
});
exports.createQueue = createQueue;
// DELETE QUEUE - Admin deletes a queue/patient record
const deleteQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Delete the patient from queue
        const deletedPatient = yield prisma.patient.delete({
            where: { id },
        });
        // Emit real-time update
        const io = req.app.get("io");
        const updatedQueue = yield prisma.patient.findMany({
            where: { clinicId: deletedPatient.clinicId, status: "WAITING" },
            orderBy: { token: "asc" },
        });
        io.emit("queue_update", updatedQueue);
        res.status(200).json({ success: true, message: "Patient removed from queue" });
    }
    catch (error) {
        console.error("Error deleting from queue:", error);
        res.status(500).json({ success: false, error: "Failed to delete from queue" });
    }
});
exports.deleteQueue = deleteQueue;
