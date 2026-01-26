import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import queueRoutes from "./routes/queue.routes";
import pageRoutes from "./routes/page.routes";

// Load Config
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io (The "Pulse" of Queue Pro)
const io = new Server(server, {
  cors: {
    origin: "*", // Allow your mobile app to connect
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Logger
app.use("/api/queue", queueRoutes);
app.use("/api/pages", pageRoutes);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({ status: "active", service: "Queue Pro API" });
});

// --- SOCKET LOGIC ---
io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // Join a specific clinic room
  socket.on("join_clinic", (clinicId) => {
    socket.join(clinicId);
    console.log(`Socket ${socket.id} joined clinic ${clinicId}`);
  });

  // Handle Disconnect
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
