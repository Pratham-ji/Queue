import { create } from "zustand";
import { api, socket } from "../services/api";
import { AppState, AppStateStatus } from "react-native";

// Types
export interface Patient {
  id: string;
  name: string;
  token: number;
  type: string;
  status: "WAITING" | "SERVED" | "MISSED";
  arrivalTime: string;
}

// Your real clinic ID
const CLINIC_ID = "c86b8cc6-d4a3-4d30-acd6-98066ba616ee";

interface QueueState {
  currentPatient: Patient | null;
  queue: Patient[];
  isOnline: boolean;

  // Actions
  fetchQueue: () => Promise<void>;
  toggleOnline: () => void;
  callNextPatient: () => Promise<void>;
  initializeSocket: () => void;
  setupAppStateListener: () => () => void;
}

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
      if (__DEV__) console.error("Failed to fetch queue:", error);
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
    } else {
      socket.disconnect();
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
      if (__DEV__) console.error("Call Next Failed:", error);
      // Rollback — re-fetch on failure
      get().fetchQueue();
    }
  },

  // 4. LISTEN FOR LIVE UPDATES (with reconnection)
  initializeSocket: () => {
    socket.off("queue_update");
    socket.on("queue_update", (updatedQueue: Patient[]) => {
      set({ queue: updatedQueue });
    });

    socket.off("current_patient");
    socket.on("current_patient", (patient: Patient) => {
      set({ currentPatient: patient });
    });

    // Re-join room on reconnect
    socket.off("reconnect");
    socket.on("reconnect", () => {
      if (__DEV__) console.log("Socket reconnected — re-syncing");
      socket.emit("join_clinic", CLINIC_ID);
      get().fetchQueue();
    });
  },

  // 5. APP STATE LISTENER — reconnect when foregrounding
  setupAppStateListener: () => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        const { isOnline } = get();
        if (isOnline) {
          if (!socket.connected) {
            socket.connect();
            socket.emit("join_clinic", CLINIC_ID);
          }
          get().fetchQueue();
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  },
}));
