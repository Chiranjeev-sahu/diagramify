import { create } from "zustand";
import apiClient from "@/api/apiClient";
import { toast } from "sonner";
import { useChatStore } from "./useChatStore";

export const useDiagramStore = create((set, get) => ({
  latestDiagrams: [],
  currentDiagram: null,
  isGenerating: false,
  isLoading: false,
  error: null,

  fetchLatestDiagrams: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/api/v1/diagrams/latest");
      set({
        latestDiagrams: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to fetch diagrams";
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
    }
  },

  generateDiagram: async (prompt) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await apiClient.post("/api/v1/diagrams/generate", {
        prompt,
      });

      const diagrams = response.data.data;

      if (!diagrams || diagrams.length === 0) {
        toast.warning("No diagrams were generated. Try a different prompt.");
        set({ isGenerating: false });
        return [];
      }

      set({
        currentDiagram: diagrams[0],
        isGenerating: false,
      });

      useChatStore.getState().reset();
      
      if (diagrams[0].chatId) {
        useChatStore.getState().fetchChatHistory(diagrams[0].chatId);
      }

      get().fetchLatestDiagrams();

      toast.success(`Generated ${diagrams.length} diagram${diagrams.length > 1 ? "s" : ""}!`);
      return diagrams;
    } catch (error) {
      console.error("Diagram generation error:", error);
      console.error("Error response:", error.response?.data);
      const errorMsg = error.response?.data?.message || "Failed to generate diagram";
      set({ error: errorMsg, isGenerating: false });
      toast.error(errorMsg);
      return [];
    }
  },

  repromptDiagram: async (diagramId, prompt) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await apiClient.patch(
        `/api/v1/diagrams/${diagramId}/reprompt`,
        { newPrompt: { prompt } }
      );

      const newVersion = response.data.data;

      set({
        currentDiagram: newVersion,
        isGenerating: false,
      });

      get().fetchLatestDiagrams();

      return newVersion;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update diagram";
      set({ error: errorMsg, isGenerating: false });
      toast.error(errorMsg);
      return null;
    }
  },

  updateDiagramCode: async (diagramId, code) => {
    set({ error: null });
    try {
      const response = await apiClient.put(
        `/api/v1/diagrams/${diagramId}/code`,
        { code }
      );

      const updatedDiagram = response.data.data;

      const current = get().currentDiagram;
      if (current && current._id === diagramId) {
        set({ currentDiagram: updatedDiagram });
      }

      return updatedDiagram;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update code";
      set({ error: errorMsg });
      toast.error(errorMsg);
      return null;
    }
  },

  deleteDiagram: async (diagramId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.delete(`/api/v1/diagrams/${diagramId}`);

      const { latestDiagrams, currentDiagram } = get();
      set({
        latestDiagrams: latestDiagrams.filter((d) => d._id !== diagramId),
        currentDiagram:
          currentDiagram?._id === diagramId ? null : currentDiagram,
        isLoading: false,
      });

      toast.success(
        `Deleted ${response.data.data.deletedCount} diagram version(s)`
      );
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to delete diagram";
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  setCurrentDiagram: (diagram) => {
    set({ currentDiagram: diagram });
  },

  
  clearCurrentDiagram: () => {
    set({ currentDiagram: null });
  },

  
  updateCurrentDiagramCodeLocally: (newCode) => {
    const current = get().currentDiagram;
    if (current) {
      set({
        currentDiagram: {
          ...current,
          diagramCode: newCode,
        },
      });
    }
  },

  
  clearError: () => {
    set({ error: null });
  },

  
  reset: () => {
    set({
      latestDiagrams: [],
      currentDiagram: null,
      isGenerating: false,
      isLoading: false,
      error: null,
    });
  },
}));
