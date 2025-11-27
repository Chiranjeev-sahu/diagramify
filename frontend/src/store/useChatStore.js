import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/api/apiClient";
import { toast } from "sonner";

export const useChatStore = create(
  persist(
    (set, get) => ({
      currentChat: null, 
      isLoading: false,
      error: null,

      fetchChatHistory: async (chatId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get(`/api/v1/chats/${chatId}`);
          const chatData = response.data.data;

          set({
            currentChat: chatData,
            isLoading: false,
          });

          return chatData;
        } catch (error) {
          const errorMsg =
            error.response?.data?.message || "Failed to fetch chat history";
          set({ error: errorMsg, isLoading: false });
          toast.error(errorMsg);
          return null;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          currentChat: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        currentChat: state.currentChat,
      }),
    }
  )
);