import { create } from "zustand";
import { api, BASE_URL } from "../services/api";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Strip "/api" from BASE_URL to get root URL
const SERVER_URL = BASE_URL.replace(/\/api\/?$/, "");

const socket = io(SERVER_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

interface UserQueueState {
  clinicId: string | null;
  isLoading: boolean;
  activeToken: number | null;
  queueStatus: "IDLE" | "JOINED";
  queue: any[];
  peopleAhead: number;
  currentServingToken: number | null;
  estimatedWait: number;

  setClinicId: (id: string) => void;
  joinQueue: (
    name: string,
    phone: string,
    targetClinicId: string,
  ) => Promise<void>;
  leaveQueue: () => Promise<void>;
  initializeSocket: (id: string) => void;
  refreshData: (id: string) => Promise<void>;
  loadSession: () => Promise<void>; // 👈 RESTORED TYPE
}

export const useUserQueueStore = create<UserQueueState>((set, get) => ({
  clinicId: null,
  isLoading: false,
  activeToken: null,
  queueStatus: "IDLE",
  queue: [],
  peopleAhead: 0,
  currentServingToken: null,
  estimatedWait: 0,

  setClinicId: (id) => set({ clinicId: id }),

  joinQueue: async (name, phone, targetClinicId) => {
    if (!targetClinicId || !name) return;
    set({ isLoading: true, clinicId: targetClinicId });

    try {
      const res = await api.post(`/queue/${targetClinicId}/add`, {
        name,
        phone,
      });

      if (res.data.success) {
        const token = res.data.data.token;
        set({ activeToken: token, queueStatus: "JOINED" });
        await AsyncStorage.setItem("user_token", token.toString());
        await AsyncStorage.setItem("saved_clinic_id", targetClinicId);

        get().initializeSocket(targetClinicId);
        get().refreshData(targetClinicId);
      }
    } catch (error) {
      console.error("❌ Join Failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  leaveQueue: async () => {
    set({
      activeToken: null,
      queueStatus: "IDLE",
      peopleAhead: 0,
      estimatedWait: 0,
    });
    await AsyncStorage.removeItem("user_token");
    await AsyncStorage.removeItem("saved_clinic_id");
    socket.disconnect();
  },

  initializeSocket: (id) => {
    if (!socket.connected) {
      socket.connect();
      socket.emit("join_clinic", id);
    }

    socket.off("queue_update");
    socket.on("queue_update", (updatedQueue: any[]) => {
      set({ queue: updatedQueue });
      const { activeToken } = get();
      if (activeToken) {
        const myIndex = updatedQueue.findIndex((p) => p.token === activeToken);
        set({ peopleAhead: myIndex === -1 ? 0 : myIndex });
      }
    });

    socket.off("current_patient");
    socket.on("current_patient", (patient: any) => {
      set({ currentServingToken: patient.token });
      get().refreshData(id);
    });
  },

  refreshData: async (id) => {
    try {
      const res = await api.get(`/queue/${id}`);
      if (res.data.success) {
        set({
          queue: res.data.data,
          currentServingToken: res.data.current?.token || null,
        });
        const { activeToken, queue } = get();
        if (activeToken) {
          const myIndex = queue.findIndex((p: any) => p.token === activeToken);
          set({ peopleAhead: myIndex === -1 ? 0 : myIndex });
        }
      }
    } catch (error) {
      console.log("Silent refresh failed");
    }
  },

  // 👇 THE RESTORED FUNCTION (Fixes the White Screen)
  loadSession: async () => {
    try {
      const savedToken = await AsyncStorage.getItem("user_token");
      const savedClinicId = await AsyncStorage.getItem("saved_clinic_id");

      if (savedToken && savedClinicId) {
        set({
          activeToken: parseInt(savedToken),
          queueStatus: "JOINED",
          clinicId: savedClinicId,
        });
        get().initializeSocket(savedClinicId);
        get().refreshData(savedClinicId);
      }
    } catch (e) {
      console.error("Session Load Error", e);
    }
  },
}));
