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
exports.getHistory = exports.deleteQueue = exports.createQueue = exports.joinQueue = exports.addPatient = exports.callNextPatient = exports.getQueue = void 0;
const prisma_1 = require("../utils/prisma");
const pushNotification_1 = require("../services/pushNotification");
// ==========================================
// 1. GET QUEUE (Robust Version)
// ==========================================
const getQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clinicId = req.params.clinicId;
        // Fetch waiting patients from DB
        const queue = yield prisma_1.prisma.patient.findMany({
            where: {
                clinicId,
                status: "WAITING",
            },
            orderBy: { token: "asc" },
        });
        const clinic = yield prisma_1.prisma.clinic.findUnique({
            where: { id: clinicId },
            select: { isEmergencyPause: true, emergencyMessage: true, isOnline: true }
        });
        const current = yield prisma_1.prisma.patient.findFirst({
            where: {
                clinicId,
                status: "SERVING",
            },
            orderBy: { servedTime: "desc" },
        });
        if (queue.length === 0 && !current) {
            return res.status(200).json({
                success: true,
                data: [],
                current: null,
                clinic,
                message: "Queue is empty",
            });
        }
        res.status(200).json({ success: true, data: queue, current, clinic });
    }
    catch (error) {
        console.error("getQueue error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});
exports.getQueue = getQueue;
// ==========================================
// 2. CALL NEXT PATIENT — Transaction-protected
// ==========================================
const callNextPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clinicId = req.params.clinicId;
        // Use transaction to prevent race conditions when two admins click simultaneously
        const result = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Find who is next (lock the row via transaction)
            const nextPatient = yield tx.patient.findFirst({
                where: {
                    clinicId: clinicId,
                    status: "WAITING",
                },
                orderBy: { token: "asc" },
            });
            if (!nextPatient) {
                return null;
            }
            // 2. Update status to SERVING
            const served = yield tx.patient.update({
                where: { id: nextPatient.id },
                data: {
                    status: "SERVING",
                    servedTime: new Date(),
                },
            });
            return served;
        }));
        if (!result) {
            return res
                .status(400)
                .json({ success: false, message: "Queue is empty" });
        }
        // 3. BROADCAST TO ALL APPS (outside transaction — fire-and-forget)
        const io = req.app.get("io");
        const remainingQueue = yield prisma_1.prisma.patient.findMany({
            where: { clinicId: clinicId, status: "WAITING" },
            orderBy: { token: "asc" },
        });
        io.to(clinicId).emit("queue_update", remainingQueue);
        io.to(clinicId).emit("current_patient", result);
        // --- PUSH NOTIFICATION PIPELINE (non-blocking) ---
        try {
            // Position 1: The patient who is NOW being served
            if (result.expoPushToken) {
                yield (0, pushNotification_1.sendPushNotification)(result.expoPushToken, "It's Your Turn! 🏥", "Please enter the doctor's room now.");
            }
            // Position 2: The patient who is NEXT after the current one
            if (remainingQueue.length > 0 && remainingQueue[0].expoPushToken) {
                yield (0, pushNotification_1.sendPushNotification)(remainingQueue[0].expoPushToken, "You're Almost Up! ⏳", "You're next in line — please head to the waiting area.");
            }
        }
        catch (pushError) {
            console.error("Push dispatch failed (non-fatal):", pushError);
        }
        res.status(200).json({ success: true, served: result });
    }
    catch (error) {
        console.error("Error calling next:", error.message || error);
        res.status(500).json({ success: false, error: "Error calling next" });
    }
});
exports.callNextPatient = callNextPatient;
// ==========================================
// 3. ADD PATIENT
// ==========================================
const addPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone, expoPushToken } = req.body;
        const clinicId = req.params.clinicId;
        if (!name)
            return res.status(400).json({ error: "Name is required" });
        const clinic = yield prisma_1.prisma.clinic.findUnique({
            where: { id: clinicId },
        });
        if (!clinic)
            return res.status(404).json({ error: "Clinic not found" });
        // Generate Token (transaction to prevent duplicate tokens)
        const newPatient = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const todayCount = yield tx.patient.count({
                where: { clinicId: clinic.id },
            });
            const token = todayCount + 1;
            return tx.patient.create({
                data: {
                    name,
                    phone: phone || "",
                    token,
                    status: "WAITING",
                    clinicId: clinic.id,
                    expoPushToken: expoPushToken || null,
                },
            });
        }));
        // Notify Everyone
        const io = req.app.get("io");
        const updatedQueue = yield prisma_1.prisma.patient.findMany({
            where: { clinicId: clinic.id, status: "WAITING" },
            orderBy: { token: "asc" },
        });
        io.to(clinic.id).emit("queue_update", updatedQueue);
        res.status(201).json({ success: true, data: newPatient });
    }
    catch (error) {
        console.error("Error adding patient:", error.message || error);
        res.status(500).json({ success: false, error: "Failed to add patient" });
    }
});
exports.addPatient = addPatient;
// JOIN QUEUE - Allows a user to join a queue
const joinQueue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, phone, clinicId, expoPushToken } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!name || !clinicId) {
            return res.status(400).json({ error: "Name and clinicId are required" });
        }
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Check if clinic exists
        const clinic = yield prisma_1.prisma.clinic.findUnique({
            where: { id: clinicId },
        });
        if (!clinic) {
            return res.status(404).json({ error: "Clinic not found" });
        }
        // Generate token (transaction for safety)
        const newPatient = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const todayCount = yield tx.patient.count({
                where: { clinicId },
            });
            const token = todayCount + 1;
            return tx.patient.create({
                data: {
                    name,
                    phone: phone || "",
                    token,
                    status: "WAITING",
                    clinicId,
                    expoPushToken: expoPushToken || null,
                },
            });
        }));
        // Emit real-time update
        const io = req.app.get("io");
        const updatedQueue = yield prisma_1.prisma.patient.findMany({
            where: { clinicId, status: "WAITING" },
            orderBy: { token: "asc" },
        });
        io.to(clinicId).emit("queue_update", updatedQueue);
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
        const { name, address, city, image } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!name) {
            return res.status(400).json({ error: "Clinic name is required" });
        }
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Check if user already owns a clinic
        const existingClinic = yield prisma_1.prisma.clinic.findFirst({
            where: { ownerId: userId },
        });
        if (existingClinic) {
            return res.status(400).json({ error: "You already own a clinic" });
        }
        // Create new clinic with M:N membership
        const newClinic = yield prisma_1.prisma.clinic.create({
            data: {
                name,
                address: address || "",
                city: city || "Dehradun",
                image: image || "",
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: "OWNER",
                        isPrimary: true,
                    },
                },
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
        const deletedPatient = yield prisma_1.prisma.patient.delete({
            where: { id },
        });
        // Emit real-time update
        const io = req.app.get("io");
        const updatedQueue = yield prisma_1.prisma.patient.findMany({
            where: { clinicId: deletedPatient.clinicId, status: "WAITING" },
            orderBy: { token: "asc" },
        });
        io.to(deletedPatient.clinicId).emit("queue_update", updatedQueue);
        res.status(200).json({ success: true, message: "Patient removed from queue" });
    }
    catch (error) {
        console.error("Error deleting from queue:", error);
        res.status(500).json({ success: false, error: "Failed to delete from queue" });
    }
});
exports.deleteQueue = deleteQueue;
// ==========================================
// GET HISTORY (Past Visits for the User)
// ==========================================
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }
        const user = yield prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        // Find patients linked to this user's phone or name who are COMPLETED
        const pastVisits = yield prisma_1.prisma.patient.findMany({
            where: {
                OR: [
                    { phone: user.phone || "___unlikely_match___" },
                    { name: user.name }
                ],
                status: "COMPLETED"
            },
            include: {
                clinic: {
                    select: { name: true, city: true }
                }
            },
            orderBy: { completedTime: "desc" }
        });
        res.status(200).json({ success: true, data: pastVisits });
    }
    catch (error) {
        console.error("getHistory error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});
exports.getHistory = getHistory;
