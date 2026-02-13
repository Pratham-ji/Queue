import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import otpRoutes from "./auth/otp.routes";
import uploadRoutes from "./routes/upload.routes";

// Existing Queue routes
import queueRoutes from "./routes/queue.routes";
import authRoutes from "./routes/auth.routes";
import hospitalRoutes from "./routes/hospital.routes";
import adminRoutes from "./routes/admin.routes";
import providerRoutes from "./routes/provider.routes";
import {
  createSession,
  joinSession,
  getSessionDetails,
  callNext,
} from "./controllers/custom.controller";

// ✅ FIX: Import BOTH functions here
import {
  createAppointment,
  getMyAppointments,
} from "./controllers/booking.controller";

// Load Config
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// ✅ ROUTES
app.use("/api/queue", queueRoutes);

// 🔥 OTP AUTH ROUTES (THIS WAS MISSING)
app.use("/api/auth", otpRoutes);
app.use("/api/auth", authRoutes); // This enables /api/auth/login

// --- 🚦 ROUTES ---
app.use("/api/queue", queueRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/provider", providerRoutes);

app.post("/api/booking/create", createAppointment);
app.get("/api/booking/my-appointments", getMyAppointments); // This will work now

app.post("/api/custom/create", createSession);
app.post("/api/custom/join", joinSession);
app.get("/api/custom/:sessionId", getSessionDetails);
app.post("/api/custom/next", callNext);

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

  socket.on("join_session_room", (sessionId) => {
    socket.join(`session_${sessionId}`);
    console.log(`Socket joined session room: ${sessionId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.set("io", io);

// Start Server
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
