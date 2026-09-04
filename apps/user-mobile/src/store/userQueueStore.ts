import { create } from "zustand";
import { api } from "../services/api";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";

// Environment-driven Socket URL
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "http://13.201.230.245:5001";

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
  activeClinicId: string | null;   // Dynamic — set when user picks a clinic
  queueStatus: "IDLE" | "JOINED";
  queue: any[];
  peopleAhead: number;
  currentServingToken: number | null;
  estimatedWait: number; // In minutes
  expoPushToken: string | null;
  isOffline: boolean;
  isClinicOffline: boolean;
  isEmergencyPause: boolean;
  emergencyMessage: string | null;
  activePrescription: any | null;

  setClinic: (clinicId: string) => void;
  joinQueue: (name: string, phone: string) => Promise<void>;
  leaveQueue: () => Promise<void>;
  initializeSocket: () => void;
  loadSession: () => Promise<void>;
  refreshData: () => Promise<void>;
  setupAppStateListener: () => () => void;
  registerPushToken: () => Promise<void>;
  setOfflineStatus: (status: boolean) => void;
}

// Keep a polling timer reference outside state to prevent re-renders on every tick
let pollingTimer: NodeJS.Timeout | null = null;

export const useUserQueueStore = create<UserQueueState>((set, get) => ({
  isLoading: false,
  activeToken: null,
  activeClinicId: null,
  queueStatus: "IDLE",
  queue: [],
  peopleAhead: 0,
  currentServingToken: null,
  estimatedWait: 0,
  expoPushToken: null,
  isOffline: false,
  isClinicOffline: false,
  isEmergencyPause: false,
  emergencyMessage: null,
  activePrescription: null,

  setOfflineStatus: (status) => set({ isOffline: status }),

  // 0. SET CLINIC (called from navigation — user picks a clinic)
  setClinic: (clinicId: string) => {
    set({ activeClinicId: clinicId });
  },

  // 0.5 REGISTER PUSH TOKEN
  registerPushToken: async () => {
    try {
      const { registerForPushNotifications } = await import("../services/notifications");
      const token = await registerForPushNotifications();
      if (token) {
        set({ expoPushToken: token });
      }
    } catch (e) {
      console.warn("Could not register push token", e);
    }
  },

  // 1. JOIN QUEUE (uses dynamic clinicId)
  joinQueue: async (name, phone) => {
    const { activeClinicId, expoPushToken } = get();
    if (!name || !activeClinicId) return;

    set({ isLoading: true });
    try {
      const payload = { name, phone, expoPushToken };
      console.log('JOIN QUEUE PAYLOAD:', payload);
      const res = await api.post(`/queue/${activeClinicId}/add`, payload);

      if (res.data.success) {
        const token = res.data.data.token;
        set({ activeToken: token, queueStatus: "JOINED" });
        await AsyncStorage.setItem("user_token", token.toString());
        await AsyncStorage.setItem("user_clinic_id", activeClinicId);
        get().initializeSocket();
        get().refreshData();
      }
    } catch (error: any) {
      console.error("Join Failed:", error);
      import("react-native").then(({ Alert }) => {
        Alert.alert("Booking Failed", error?.response?.data?.error || error?.response?.data?.message || error.message);
      });
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
    await AsyncStorage.removeItem("user_clinic_id");
    socket.disconnect();
  },

  // 3. LISTEN TO LIVE UPDATES (with reconnection handling)
  initializeSocket: () => {
    const { activeClinicId } = get();
    if (!activeClinicId) return;

    if (!socket.connected) {
      socket.connect();
      socket.emit("join_clinic", activeClinicId);
    }

    // Manage polling on connection drops
    socket.off("disconnect");
    socket.on("disconnect", () => {
      if (__DEV__) console.warn("Socket disconnected — starting polling fallback");
      if (!pollingTimer) {
        pollingTimer = setInterval(() => {
          if (!socket.connected) get().refreshData();
        }, 5000); // Poll every 5s
      }
    });

    // Re-join room on reconnect (critical for background recovery)
    socket.off("reconnect");
    socket.on("reconnect", () => {
      if (__DEV__) console.log("Socket reconnected — stopping polling & re-syncing");
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
      const { activeClinicId: currentClinic } = get();
      if (currentClinic) {
        socket.emit("join_clinic", currentClinic);
      }
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

    // C. Queue Paused / Resumed (Emergency & Break)
    socket.off("queue_paused");
    socket.on("queue_paused", (data: { reason: string }) => {
      set({
        isEmergencyPause: true,
        emergencyMessage: data.reason
      });
    });

    socket.off("queue_resumed");
    socket.on("queue_resumed", () => {
      set({
        isEmergencyPause: false,
        emergencyMessage: null
      });
    });

    // D. Clinic Online Status Update
    socket.off(`clinic_online_${activeClinicId}`);
    socket.on(`clinic_online_${activeClinicId}`, (data: { isOnline: boolean }) => {
      set({ isClinicOffline: !data.isOnline });
    });

    // E. Prescription Issued
    socket.off("new_prescription");
    socket.on("new_prescription", (prescription: any) => {
      const { activeToken } = get();
      if (activeToken && prescription.patient?.token === activeToken) {
        set({ activePrescription: prescription });
      }
    });

    // F. Prescription Fulfilled by Pharmacy
    socket.off("prescription_fulfilled");
    socket.on("prescription_fulfilled", (prescription: any) => {
      const { activePrescription } = get();
      if (activePrescription && activePrescription.id === prescription.id) {
        set({ activePrescription: null, queueStatus: "IDLE", activeToken: null });
        AsyncStorage.removeItem("active_token");
      }
    });
  },

  // 4. FORCE REFRESH (uses dynamic clinicId)
  refreshData: async () => {
    try {
      const { activeClinicId } = get();
      if (!activeClinicId) return;

      const res = await api.get(`/queue/${activeClinicId}`);

      if (res.data.success) {
        const list = res.data.data; // Waiting List
        const current = res.data.current; // Currently Serving
        const clinic = res.data.clinic;

        set({
          queue: list,
          currentServingToken: current ? current.token : null,
          isEmergencyPause: clinic?.isEmergencyPause || false,
          emergencyMessage: clinic?.emergencyMessage || null,
          isClinicOffline: clinic ? !clinic.isOnline : false,
        });

        // Recalculate Position
        const { activeToken } = get();
        if (activeToken) {
          const myIndex = list.findIndex((p: any) => p.token === activeToken);
          const ahead = myIndex === -1 ? 0 : myIndex;
          set({ peopleAhead: ahead, estimatedWait: ahead * 10 });
          
          if (myIndex === -1) {
            // Not in waiting queue. Are they served with a prescription?
            try {
              const prescRes = await api.get(`/prescription/patient/active?clinicId=${activeClinicId}&token=${activeToken}`);
              if (prescRes.data.success && prescRes.data.data) {
                set({ activePrescription: prescRes.data.data });
              } else {
                // Completely done or cancelled
                set({ queueStatus: "IDLE", activeToken: null, activePrescription: null });
                AsyncStorage.removeItem("active_token");
              }
            } catch (err) {
              console.log("Failed to fetch prescription state");
            }
          }
        }
      }
    } catch (error) {
      if (__DEV__) console.log("Silent refresh failed — Check Network/IP");
    }
  },

  // 5. RESTORE SESSION (loads clinicId + token from storage)
  loadSession: async () => {
    const savedToken = await AsyncStorage.getItem("user_token");
    const savedClinicId = await AsyncStorage.getItem("user_clinic_id");

    if (savedToken && savedClinicId) {
      set({
        activeToken: parseInt(savedToken),
        activeClinicId: savedClinicId,
        queueStatus: "JOINED",
      });
      get().initializeSocket();
      get().refreshData();
    }
  },

  // 6. APP STATE LISTENER — reconnect socket when app foregrounds
  setupAppStateListener: () => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        const { queueStatus, activeClinicId } = get();
        if (queueStatus === "JOINED" && activeClinicId) {
          // App came to foreground — reconnect if needed
          if (!socket.connected) {
            socket.connect();
            socket.emit("join_clinic", activeClinicId);
          }
          get().refreshData();
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  },

  // 7. OFFLINE STATUS handled earlier
}));
