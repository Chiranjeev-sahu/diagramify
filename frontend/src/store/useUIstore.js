import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeView: "split",

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      setActiveView: (view) => {
        set({ activeView: view });
      },

      reset: () => {
        set({
          sidebarCollapsed: false,
          activeView: "split",
        });
      },
    }),
    {
      name: "ui-storage",
    }
  )
);
