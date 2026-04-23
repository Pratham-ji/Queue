import dotenv from "dotenv";
// Load Config FIRST, before any other imports
dotenv.config();

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
import adminRoutes from "./routes/admin.routes";
import providerRoutes from "./routes/provider.routes";
import doctorRoutes from "./routes/doctor.routes";

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
  max: 100,
  message: "Too many requests from this IP. Please try again later.",
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
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// Booking (inline routes)
app.post("/api/booking/create", createAppointment);
app.get("/api/booking/my-appointments", getMyAppointments);

// Custom Session (inline routes)
app.post("/api/session/create", createSession);
app.post("/api/session/join", joinSession);
app.get("/api/session/:sessionId", getSessionDetails);
app.post("/api/session/call-next", callNext);

// Role-based routes
app.use("/api/doctor", doctorRoutes);

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
