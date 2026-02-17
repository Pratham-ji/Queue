import axios from "axios";
import { Platform } from "react-native";

// 🔧 CONFIG: Your Laptop's Current IP (Home WiFi)
// If you switch back to Hotspot, change this to 172.20.10.2
// const BASE_URL = "http://192.168.31.69:5001"; // home ip
export const BASE_URL = "http://172.20.10.3:5001"; // jio phone

// 1. Create the Axios Instance
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Add Logger (Optional but amazing for debugging)
api.interceptors.request.use((request) => {
  console.log(
    "📡 User App Request:",
    request.method?.toUpperCase(),
    request.url,
  );
  return request;
});

// 3. Add Error Handling (So the app doesn't crash silently)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);
