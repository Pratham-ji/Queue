"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Route imports
const otp_routes_1 = __importDefault(require("./auth/otp.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const queue_routes_1 = __importDefault(require("./routes/queue.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const hospital_routes_1 = __importDefault(require("./routes/hospital.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const provider_routes_1 = __importDefault(require("./routes/provider.routes"));
const doctor_routes_1 = __importDefault(require("./routes/doctor.routes"));
const prescription_routes_1 = __importDefault(require("./routes/prescription.routes"));
const marketplace_routes_1 = __importDefault(require("./routes/marketplace.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
// Controller imports for inline routes
const custom_controller_1 = require("./controllers/custom.controller");
const booking_controller_1 = require("./controllers/booking.controller");
// ───────────────────────────────────────────────
// APP SETUP
// ───────────────────────────────────────────────
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Parse allowed CORS origins from env (comma-separated)
const allowedOrigins = (process.env.CORS_ORIGIN || "*").split(",").map((s) => s.trim());
// Initialize Socket.io
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? allowedOrigins : "*",
        methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});
// ───────────────────────────────────────────────
// MIDDLEWARE
// ───────────────────────────────────────────────
app.use(express_1.default.json());
// CORS — strict in production, open in dev
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production" ? allowedOrigins : "*",
    credentials: true,
}));
// Security headers
app.use((0, helmet_1.default)());
// Rate limiting — 100 requests per 15 minutes per IP
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 3000,
    message: { error: "Too many requests from this IP. Please try again later.", success: false },
});
app.use(globalLimiter);
// Request logging (dev only)
if (process.env.NODE_ENV !== "production") {
    app.use((0, morgan_1.default)("dev"));
}
// Cache-Control — prevent stale 304s on API responses
app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");
    next();
});
// ───────────────────────────────────────────────
// ROUTES
// ───────────────────────────────────────────────
// Auth
app.use("/api/auth", otp_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
// Core
app.use("/api/queue", queue_routes_1.default);
app.use("/api/hospital", hospital_routes_1.default);
app.use("/api/provider", provider_routes_1.default);
app.use("/api/provider", marketplace_routes_1.default); // M:N marketplace endpoints
app.use("/api/admin", admin_routes_1.default);
app.use("/api/upload", upload_routes_1.default);
app.use("/api/chat", chat_routes_1.default);
// Booking (inline routes)
app.post("/api/booking/create", booking_controller_1.createAppointment);
app.get("/api/booking/my-appointments", booking_controller_1.getMyAppointments);
// Custom Session (inline routes — /session/ and /custom/ aliases)
app.post("/api/session/create", custom_controller_1.createSession);
app.post("/api/session/join", custom_controller_1.joinSession);
app.get("/api/session/:sessionId", custom_controller_1.getSessionDetails);
app.post("/api/session/call-next", custom_controller_1.callNext);
// Mobile app uses /custom/ prefix — alias to same handlers
app.post("/api/custom/create", custom_controller_1.createSession);
app.post("/api/custom/join", custom_controller_1.joinSession);
app.get("/api/custom/:sessionId", custom_controller_1.getSessionDetails);
app.post("/api/custom/next", custom_controller_1.callNext);
// Role-based routes
app.use("/api/doctor", doctor_routes_1.default);
// Feature Routes
app.use("/api/prescription", prescription_routes_1.default);
// Test routes — ONLY in development
if (process.env.NODE_ENV !== "production") {
    const testRoutes = require("./routes/test.routes").default;
    app.use("/test", testRoutes);
}
// Health Check
app.get("/", (req, res) => {
    res.status(200).json({
        status: "active",
        service: "Queue Pro API",
        environment: process.env.NODE_ENV || "development",
    });
});
// ───────────────────────────────────────────────
// SOCKET LOGIC
// ───────────────────────────────────────────────
io.on("connection", (socket) => {
    socket.on("join_clinic", (clinicId) => {
        socket.join(clinicId);
    });
    socket.on("join_session_room", (sessionId) => {
        socket.join(`session_${sessionId}`);
    });
    socket.on("disconnect", () => {
        // Client disconnected — socket.io handles cleanup
    });
});
app.set("io", io);
// ───────────────────────────────────────────────
// START SERVER
// ───────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`
  🚀 SERVER RUNNING
  -----------------
  • Port:     ${PORT}
  • Mode:     ${process.env.NODE_ENV || "development"}
  • Socket:   Active
  `);
});
