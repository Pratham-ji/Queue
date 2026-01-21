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

export const useQueueStore = create<QueueState>((set, get) => ({
  currentPatient: null,
  queue: [],
  isOnline: false,

  // 1. FETCH FROM BACKEND
  fetchQueue: async () => {
    try {
      const res = await api.get("/queue/clinic_1"); // 'clinic_1' is a placeholder ID
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
      socket.connect();
      socket.emit("join_clinic", "clinic_1");
      console.log("🟢 Socket Connected");
    } else {
      socket.disconnect();
      console.log("🔴 Socket Disconnected");
    }
  },

  // 3. REAL API CALL
  callNextPatient: async () => {
    try {
      const { queue } = get();
      if (queue.length === 0) return;

      // Optimistic Update (Update UI instantly)
      const next = queue[0];
      const remaining = queue.slice(1);
      set({ currentPatient: next, queue: remaining });

      // Send to Backend
      await api.post("/queue/clinic_1/next");
    } catch (error) {
      console.error("Call Next Failed:", error);
      // Revert if failed (Optional logic here)
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
