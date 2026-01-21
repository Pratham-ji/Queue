import axios from "axios";
import { io } from "socket.io-client";
import { Platform } from "react-native";

// ANDROID EMULATOR uses 10.0.2.2, iOS uses localhost
const BASE_URL =
  Platform.OS === "android" ? "http://172.20.10.2:5001" : "http://localhost:5001";

// 1. HTTP CLIENT
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 2. SOCKET CONNECTION (The "Pulse")
export const socket = io(BASE_URL, {
  autoConnect: false,
  transports: ["websocket"], // Forces modern transport
});

// Helper to log requests (Great for debugging)
api.interceptors.request.use((request) => {
  console.log("📡 API Request:", request.method?.toUpperCase(), request.url);
  return request;
});
