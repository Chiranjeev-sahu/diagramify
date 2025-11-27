import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

export const useTrialStore = create(
  persist(
    (set, get) => ({
      trialsUsed: 0,
      maxTrials: 3,

      incrementTrial: () => {
        const state = get();
        if (state.trialsUsed < state.maxTrials) {
          set({ trialsUsed: state.trialsUsed + 1 });
          
          const remaining = state.maxTrials - state.trialsUsed - 1;
          if (remaining === 1) {
            toast.warning("1 free trial remaining! Sign up to continue.");
          } else if (remaining === 0) {
            toast.error("Free trial limit reached! Please sign up to continue.");
          }
        }
      },

      resetTrials: () => {
        set({ trialsUsed: 0 });
      },

      hasTrialsLeft: () => {
        const state = get();
        return state.trialsUsed < state.maxTrials;
      },

      getRemainingTrials: () => {
        const state = get();
        return state.maxTrials - state.trialsUsed;
      },
    }),
    {
      name: "trial-storage",
    }
  )
);
