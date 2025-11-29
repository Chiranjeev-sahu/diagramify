import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { FullPageLoader } from "@/components/ui/LoadingStates";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
