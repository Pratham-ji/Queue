import { create } from "zustand";
import { api } from "../services/api";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";

// Environment-driven Socket URL
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:5001";

const CLINIC_ID = "c86b8cc6-d4a3-4d30-acd6-98066ba616ee";

// Socket singleton with aggressive reconnection
let socket: Socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
});

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
  setupAppStateListener: () => () => void;
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
      if (__DEV__) console.error("Join Failed:", error);
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

  // 3. LISTEN TO LIVE UPDATES (with reconnection handling)
  initializeSocket: () => {
    if (!socket.connected) {
      socket.connect();
      socket.emit("join_clinic", CLINIC_ID);
    }

    // Re-join room on reconnect (critical for background recovery)
    socket.off("reconnect");
    socket.on("reconnect", () => {
      if (__DEV__) console.log("Socket reconnected — re-syncing");
      socket.emit("join_clinic", CLINIC_ID);
      get().refreshData();
    });

    // A. Queue List Update
    socket.off("queue_update");
    socket.on("queue_update", (updatedQueue: any[]) => {
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
      set({ currentServingToken: patient.token });
      get().refreshData(); // Force sync
    });
  },

  // 4. FORCE REFRESH
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
      if (__DEV__) console.log("Silent refresh failed — Check Network/IP");
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

  // 6. APP STATE LISTENER — reconnect socket when app foregrounds
  setupAppStateListener: () => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        const { queueStatus } = get();
        if (queueStatus === "JOINED") {
          // App came to foreground — reconnect if needed
          if (!socket.connected) {
            socket.connect();
            socket.emit("join_clinic", CLINIC_ID);
          }
          get().refreshData();
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  },
}));
