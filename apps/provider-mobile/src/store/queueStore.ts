import { create } from "zustand";
import { api, socket } from "../services/api";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export interface Patient {
  id: string;
  name: string;
  token: number;
  type: string;
  status: "WAITING" | "SERVED" | "MISSED";
  arrivalTime: string;
}

export interface ClinicInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  image: string;
  verified: boolean;
  rating: number;
  memberRole: string;
  isPrimary: boolean;
  isEmergencyPause: boolean;
}

interface QueueState {
  // Dynamic clinic state (replaces hardcoded CLINIC_ID)
  activeClinicId: string | null;
  activeClinic: ClinicInfo | null;
  allClinics: ClinicInfo[];

  currentPatient: Patient | null;
  queue: Patient[];
  isOnline: boolean;
  analytics: {
    totalPatients: number;
    avgWaitTime: number;
    prescriptionsIssued: number;
    trend: string;
    trendUp: boolean;
  } | null;

  // Actions
  fetchMyClinics: () => Promise<void>;
  setActiveClinic: (clinicId: string) => Promise<void>;
  fetchQueue: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  toggleOnline: () => void;
  callNextPatient: () => Promise<void>;
  initializeSocket: () => void;
  setupAppStateListener: () => () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  activeClinicId: null,
  activeClinic: null,
  allClinics: [],
  currentPatient: null,
  queue: [],
  isOnline: false,
  analytics: null,

  fetchAnalytics: async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;
      const { activeClinicId } = get();
      const endpoint = activeClinicId 
        ? `/provider/analytics?clinicId=${activeClinicId}` 
        : `/provider/analytics`;
        
      const res = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        set({ analytics: res.data.data });
      }
    } catch (e) {
      if (__DEV__) console.error("Failed to fetch analytics:", e);
    }
  },

  // 0. FETCH PROVIDER'S CLINICS (marketplace query)
  fetchMyClinics: async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const res = await api.get("/provider/my-clinics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const clinics: ClinicInfo[] = res.data.data;
        set({ allClinics: clinics });

        // Auto-select the primary clinic (or first if none is primary)
        const primary = clinics.find((c) => c.isPrimary) || clinics[0];
        if (primary) {
          set({ activeClinicId: primary.id, activeClinic: primary });
        }
      }
    } catch (error) {
      if (__DEV__) console.error("Failed to fetch clinics:", error);
    }
  },

  // 0b. SWITCH ACTIVE CLINIC
  setActiveClinic: async (clinicId: string) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await api.post(
        "/provider/switch-clinic",
        { clinicId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const clinic = get().allClinics.find((c) => c.id === clinicId) || null;
      set({ activeClinicId: clinicId, activeClinic: clinic, queue: [], currentPatient: null });

      // Reconnect socket to new clinic room
      if (get().isOnline) {
        socket.emit("join_clinic", clinicId);
      }

      get().fetchQueue();
    } catch (error) {
      if (__DEV__) console.error("Switch clinic failed:", error);
    }
  },

  // 1. FETCH FROM BACKEND (uses dynamic clinicId)
  fetchQueue: async () => {
    try {
      const { activeClinicId } = get();
      if (!activeClinicId) return;

      const res = await api.get(`/queue/${activeClinicId}`);
      if (res.data.success) {
        set({ 
          queue: res.data.data,
          currentPatient: res.data.current || null
        });
      }
    } catch (error) {
      if (__DEV__) console.error("Failed to fetch queue:", error);
    }
  },

  // 2. GO ONLINE & CONNECT SOCKET
  toggleOnline: () => {
    const { isOnline, activeClinicId } = get();
    if (!activeClinicId) return;

    const newState = !isOnline;
    set({ isOnline: newState });

    if (newState) {
      if (!socket.connected) socket.connect();
      socket.emit("join_clinic", activeClinicId);
    } else {
      socket.disconnect();
    }
  },

  // 3. CALL NEXT PATIENT
  callNextPatient: async () => {
    try {
      const { queue, activeClinicId } = get();
      if (queue.length === 0 || !activeClinicId) return;

      // Optimistic Update
      const next = queue[0];
      const remaining = queue.slice(1);
      set({ currentPatient: next, queue: remaining });

      await api.post(`/queue/${activeClinicId}/next`);
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

    // Re-join room on reconnect (using dynamic ID)
    socket.off("reconnect");
    socket.on("reconnect", () => {
      if (__DEV__) console.log("Socket reconnected — re-syncing");
      const { activeClinicId } = get();
      if (activeClinicId) {
        socket.emit("join_clinic", activeClinicId);
      }
      get().fetchQueue();
    });
  },

  // 5. APP STATE LISTENER — reconnect when foregrounding
  setupAppStateListener: () => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        const { isOnline, activeClinicId } = get();
        if (isOnline && activeClinicId) {
          if (!socket.connected) {
            socket.connect();
            socket.emit("join_clinic", activeClinicId);
          }
          get().fetchQueue();
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  },
}));
