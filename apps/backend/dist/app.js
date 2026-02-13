"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load Config FIRST, before any other imports
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
// ✅ IMPORT OTP ROUTES (IMPORTANT)
const otp_routes_1 = __importDefault(require("./auth/otp.routes"));
// Existing Queue routes
const queue_routes_1 = __importDefault(require("./routes/queue.routes"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Initialize Socket.io (The "Pulse" of Queue Pro)
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
// ✅ ROUTES
app.use("/api/queue", queue_routes_1.default);
// 🔥 OTP AUTH ROUTES (THIS WAS MISSING)
app.use("/api/auth", otp_routes_1.default);
app.use("/test", test_routes_1.default); //testing
// Health Check
app.get("/", (req, res) => {
    res.status(200).json({
        status: "active",
        service: "Queue Pro API",
    });
});
// --- SOCKET LOGIC ---
io.on("connection", (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);
    socket.on("join_clinic", (clinicId) => {
        socket.join(clinicId);
        console.log(`Socket ${socket.id} joined clinic ${clinicId}`);
    });
    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});
// Make IO accessible globally
app.set("io", io);
// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`
  🚀 SERVER RUNNING
  -----------------
  • Port:     ${PORT}
  • Mode:     ${process.env.NODE_ENV || "development"}
  • Socket:   Active
  `);
});
