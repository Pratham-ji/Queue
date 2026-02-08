import { create } from "zustand";
import { api } from "../services/api";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔧 SOCKET SETUP
// const SOCKET_URL = "http://192.168.31.69:5001"; // home ip
const SOCKET_URL = "http://172.20.10.2:5001"; // phone

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

const CLINIC_ID = "c86b8cc6-d4a3-4d30-acd6-98066ba616ee";

interface UserQueueState {
  isLoading: boolean;
  activeToken: number | null;
  queueStatus: "IDLE" | "JOINED";
  queue: any[];
  peopleAhead: number;
  currentServingToken: number | null;
  estimatedWait: number; // In minutes

  joinQueue: (name: string, phone: string) => Promise<void>;
  leaveQueue: () => Promise<void>;
  initializeSocket: () => void;
  loadSession: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useUserQueueStore = create<UserQueueState>((set, get) => ({
  isLoading: false,
  activeToken: null,
  queueStatus: "IDLE",
  queue: [],
  peopleAhead: 0,
  currentServingToken: null,
  estimatedWait: 0,

  // 1. JOIN QUEUE
  joinQueue: async (name, phone) => {
    if (!name) return;
    set({ isLoading: true });
    try {
      const res = await api.post(`/queue/${CLINIC_ID}/add`, { name, phone });

      if (res.data.success) {
        const token = res.data.data.token;
        set({ activeToken: token, queueStatus: "JOINED" });
        await AsyncStorage.setItem("user_token", token.toString());
        get().initializeSocket();
        get().refreshData();
      }
    } catch (error) {
      console.error("❌ Join Failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 2. LEAVE QUEUE
  leaveQueue: async () => {
    set({
      activeToken: null,
      queueStatus: "IDLE",
      peopleAhead: 0,
      estimatedWait: 0,
      currentServingToken: null,
    });
    await AsyncStorage.removeItem("user_token");
    socket.disconnect();
  },

  // 3. LISTEN TO LIVE UPDATES
  initializeSocket: () => {
    if (!socket.connected) {
      socket.connect();
      socket.emit("join_clinic", CLINIC_ID);
    }

    // A. Queue List Update
    socket.off("queue_update");
    socket.on("queue_update", (updatedQueue: any[]) => {
      console.log("⚡ Socket: Queue List Updated");
      set({ queue: updatedQueue });

      const { activeToken } = get();
      if (activeToken) {
        const myIndex = updatedQueue.findIndex((p) => p.token === activeToken);
        const ahead = myIndex === -1 ? 0 : myIndex;
        set({ peopleAhead: ahead, estimatedWait: ahead * 10 });
      }
    });

    // B. Current Patient Update
    socket.off("current_patient");
    socket.on("current_patient", (patient: any) => {
      console.log("⚡ Socket: Now Serving #", patient.token);
      set({ currentServingToken: patient.token });
      get().refreshData(); // Force sync
    });
  },

  // 4. FORCE REFRESH (Crucial Fix)
  refreshData: async () => {
    try {
      const res = await api.get(`/queue/${CLINIC_ID}`);

      if (res.data.success) {
        const list = res.data.data; // Waiting List
        const current = res.data.current; // Currently Serving

        set({
          queue: list,
          currentServingToken: current ? current.token : null,
        });

        // Recalculate Position
        const { activeToken } = get();
        if (activeToken) {
          const myIndex = list.findIndex((p: any) => p.token === activeToken);
          const ahead = myIndex === -1 ? 0 : myIndex;
          set({ peopleAhead: ahead, estimatedWait: ahead * 10 });
        }
      }
    } catch (error) {
      console.log("Silent refresh failed - Check Network/IP");
    }
  },

  // 5. RESTORE SESSION
  loadSession: async () => {
    const savedToken = await AsyncStorage.getItem("user_token");
    if (savedToken) {
      set({ activeToken: parseInt(savedToken), queueStatus: "JOINED" });
      get().initializeSocket();
      get().refreshData();
    }
  },
}));
