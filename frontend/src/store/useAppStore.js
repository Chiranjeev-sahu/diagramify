import { create } from "zustand";

export const useAppStore = create(set => ({
  trials: 0,
  incrementTrials: () => set(s => ({ trials: s.trials + 1 })),
  resetTrials: () => set({ trials: 0 }),
}));