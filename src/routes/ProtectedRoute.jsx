import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/store/auth.store";
import { LoadingScreen } from "@/components/common/LoadingScreen";

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);

  if (!hydrated) return <LoadingScreen fullScreen />;

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return children;
}