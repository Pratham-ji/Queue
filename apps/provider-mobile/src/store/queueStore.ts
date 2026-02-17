import { create } from "zustand";
import { api, socket } from "../services/api";

// Types
export interface Patient {
  id: string;
  name: string;
  token: number;
  type: string;
  status: "WAITING" | "SERVED" | "MISSED";
  arrivalTime: string;
}

// 🔑 YOUR REAL CLINIC ID
const CLINIC_ID = "eb2f2af4-84ab-4dd0-944c-d5635cdc4c97";

interface QueueState {
  currentPatient: Patient | null;
  queue: Patient[];
  isOnline: boolean;

  // Actions
  fetchQueue: () => Promise<void>;
  toggleOnline: () => void;
  callNextPatient: () => Promise<void>;
  initializeSocket: () => void;
}

// ✅ EXPORT NAME MUST BE 'useQueueStore'
export const useQueueStore = create<QueueState>((set, get) => ({
  currentPatient: null,
  queue: [],
  isOnline: false,

  // 1. FETCH FROM BACKEND
  fetchQueue: async () => {
    try {
      const res = await api.get(`/queue/${CLINIC_ID}`);
      if (res.data.success) {
        set({ queue: res.data.data });
      }
    } catch (error) {
      console.error("Failed to fetch queue:", error);
    }
  },

  // 2. GO ONLINE & CONNECT SOCKET
  toggleOnline: () => {
    const { isOnline } = get();
    const newState = !isOnline;

    set({ isOnline: newState });

    if (newState) {
      if (!socket.connected) socket.connect();
      socket.emit("join_clinic", CLINIC_ID);
      console.log("🟢 Socket Connected to Clinic:", CLINIC_ID);
    } else {
      socket.disconnect();
      console.log("🔴 Socket Disconnected");
    }
  },

  // 3. CALL NEXT PATIENT
  callNextPatient: async () => {
    try {
      const { queue } = get();
      if (queue.length === 0) return;

      // Optimistic Update
      const next = queue[0];
      const remaining = queue.slice(1);
      set({ currentPatient: next, queue: remaining });

      await api.post(`/queue/${CLINIC_ID}/next`);
    } catch (error) {
      console.error("Call Next Failed:", error);
    }
  },

  // 4. LISTEN FOR LIVE UPDATES
  initializeSocket: () => {
    socket.on("queue_update", (updatedQueue: Patient[]) => {
      console.log("⚡ Live Update Received");
      set({ queue: updatedQueue });
    });
  },
}));
