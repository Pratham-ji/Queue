import axios from "axios";
import { io } from "socket.io-client";
import { Platform } from "react-native";

// 🔧 CONFIG: Use your real IP for BOTH Android and iOS
// (Since you are on a Hotspot, localhost won't work on a physical iPhone)
const BASE_URL = "http://172.20.10.3:5001";
//const BASE_URL = "http://192.168.31.69:5001";

// 1. HTTP CLIENT
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 2. SOCKET CONNECTION
export const socket = io(BASE_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

api.interceptors.request.use((request) => {
  console.log("📡 API Request:", request.method?.toUpperCase(), request.url);
  return request;
});
