import axios from "axios";

// Environment-driven API URL — set in .env file
// EXPO_PUBLIC_ prefix makes it available at build time in Expo
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001";

// 1. Create the Axios Instance
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request interceptor — inject auth token + log
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
    console.log(
      "📡 User App Request:",
      request.method?.toUpperCase(),
      request.url,
    );
  }
  return request;
});

// 3. Response interceptor — handle errors + token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Token expired or invalid — redirect to login
    if (error.response?.status === 401) {
      try {
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        await AsyncStorage.removeItem("user_token");
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
