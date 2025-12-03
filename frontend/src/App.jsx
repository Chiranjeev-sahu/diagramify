import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { FullPageLoader } from "@/components/ui/LoadingStates";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import Auth from "@/pages/Auth";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={true}
        visibleToasts={5}
        toastOptions={{
          style: {
            marginBottom: '8px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}