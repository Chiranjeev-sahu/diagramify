import { create } from "zustand";
import apiClient from "@/api/apiClient";
import { toast } from "sonner";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/api/v1/me");
      set({
        user: response.data.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/api/v1/login", {
        email,
        password,
      });

      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success("Welcome back!");
      return true;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Login failed. Please try again.";
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  register: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/api/v1/register", {
        email,
        password,
        username,
      });

      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/api/v1/logout");
      set({ user: null, isAuthenticated: false });
      toast.success("Logged out successfully");
    } catch (error) {
      set({ user: null, isAuthenticated: false });
      toast.error("Logout failed, but you've been logged out locally");
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
}));
