import { Navigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/store/auth.store";

export function RoleRoute({ allowedRoles = [], children }) {
  const user = useAuthStore((state) => state.user);

  if (!allowedRoles.length) return children;

  if (!user || !allowedRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return children;
}