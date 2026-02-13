import dotenv from "dotenv";
// Load Config FIRST, before any other imports
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

// ✅ IMPORT OTP ROUTES (IMPORTANT)
import otpRoutes from "./auth/otp.routes";

// Existing Queue routes
import queueRoutes from "./routes/queue.routes";
import testRoutes from "./routes/test.routes"

// Role Base Access Control
import doctorRoutes from "./routes/doctor.routes";
import hospitalRoutes from "./routes/hospital.routes";

//Rate limitting appiled here
import ratelimit from "express-rate-limit";

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

//helmet amd ratelimit both implemented here
app.use(helmet());
const globalLimiter = ratelimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: "Too many requests from this IP. Please try again later.",
});
app.use(globalLimiter);
app.use(morgan("dev"));

// ✅ ROUTES
app.use("/api/queue", queueRoutes);

// 🔥 OTP AUTH ROUTES (THIS WAS MISSING)
app.use("/api/auth", otpRoutes);
app.use("/test", testRoutes);//testing

//  APPLING ROLES
app.use("/doctor", doctorRoutes);
app.use("/Hospital", hospitalRoutes);

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
