import axios from "axios";
import { io, Socket } from "socket.io-client";

// Environment-driven URLs — set in .env file
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://13.201.230.245:5001";
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "http://13.201.230.245:5001";

// 1. HTTP CLIENT
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 2. SOCKET CONNECTION (with aggressive reconnection)
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
});

// 3. Request logger + auth token injection
api.interceptors.request.use(async (request) => {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {
    // Storage read failed — proceed without token
  }
  if (__DEV__) {
    console.log("📡 API Request:", request.method?.toUpperCase(), request.url);
  }
  return request;
});

// 4. Response interceptor — handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        await AsyncStorage.removeItem("access_token");
      } catch (_) {
        // Storage cleanup failed — not critical
      }
    }
    if (__DEV__) {
      console.error("❌ API Error:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  },
);
