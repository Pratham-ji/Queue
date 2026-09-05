import "dotenv/config";

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import ratelimit from "express-rate-limit";

// Route imports
import otpRoutes from "./auth/otp.routes";
import uploadRoutes from "./routes/upload.routes";
import queueRoutes from "./routes/queue.routes";
import authRoutes from "./routes/auth.routes";
import hospitalRoutes from "./routes/hospital.routes";
import adminRoutes from "./routes/admin.routes";
import providerRoutes from "./routes/provider.routes";
import doctorRoutes from "./routes/doctor.routes";
import prescriptionRoutes from "./routes/prescription.routes";
import marketplaceRoutes from "./routes/marketplace.routes";
import chatRoutes from "./routes/chat.routes";

// Controller imports for inline routes
import {
  createSession,
  joinSession,
  getSessionDetails,
  callNext,
} from "./controllers/custom.controller";
import {
  createAppointment,
  getMyAppointments,
} from "./controllers/booking.controller";

// ───────────────────────────────────────────────
// APP SETUP
// ───────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

// Parse allowed CORS origins from env (comma-separated)
const allowedOrigins = (process.env.CORS_ORIGIN || "*").split(",").map((s) => s.trim());

// Initialize Socket.io
const io = new Server(server, {
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

app.use(express.json());

// CORS — strict in production, open in dev
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? allowedOrigins : "*",
    credentials: true,
  })
);

// Security headers
app.use(helmet());

// Rate limiting — 100 requests per 15 minutes per IP
const globalLimiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  message: { error: "Too many requests from this IP. Please try again later.", success: false },
});
app.use(globalLimiter);

// Request logging (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
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
app.use("/api/auth", otpRoutes);
app.use("/api/auth", authRoutes);

// Core
app.use("/api/queue", queueRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/provider", marketplaceRoutes);  // M:N marketplace endpoints
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);

// Booking (inline routes)
app.post("/api/booking/create", createAppointment);
app.get("/api/booking/my-appointments", getMyAppointments);

// Custom Session (inline routes — /session/ and /custom/ aliases)
app.post("/api/session/create", createSession);
app.post("/api/session/join", joinSession);
app.get("/api/session/:sessionId", getSessionDetails);
app.post("/api/session/call-next", callNext);

// Mobile app uses /custom/ prefix — alias to same handlers
app.post("/api/custom/create", createSession);
app.post("/api/custom/join", joinSession);
app.get("/api/custom/:sessionId", getSessionDetails);
app.post("/api/custom/next", callNext);

// Role-based routes
app.use("/api/doctor", doctorRoutes);

// Feature Routes
app.use("/api/prescription", prescriptionRoutes);

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

// Global 404 Fallback - Prevent HTML crashes on undefined routes
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

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
