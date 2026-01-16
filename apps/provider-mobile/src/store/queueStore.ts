import { create } from "zustand";
import { MOCK_QUEUE } from "../services/mockData";
import { Patient } from "../types";

interface QueueState {
  currentPatient: Patient | null;
  queue: Patient[];
  stats: { waiting: number; completed: number; avgTime: string };
  isOnline: boolean;

  // Actions
  toggleOnline: () => void;
  callNextPatient: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  // Initialize with Mock Data
  currentPatient: MOCK_QUEUE[0],
  queue: MOCK_QUEUE.slice(1), // Everyone else is waiting
  stats: { waiting: MOCK_QUEUE.length - 1, completed: 14, avgTime: "12m" },
  isOnline: true,

  toggleOnline: () => set((state) => ({ isOnline: !state.isOnline })),

  callNextPatient: () =>
    set((state) => {
      if (state.queue.length === 0) return state; // Edge Case: Queue Empty

      const next = state.queue[0];
      const remaining = state.queue.slice(1);

      return {
        currentPatient: { ...next, status: "In Progress" },
        queue: remaining,
        stats: {
          ...state.stats,
          waiting: remaining.length,
          completed: state.stats.completed + 1,
        },
      };
    }),
}));
