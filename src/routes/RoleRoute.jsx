import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants";

export function RoleRoute({ allowedRoles = [], children, fallbackPath = ROUTES.dashboard }) {
  const isRoleAllowed = useAuthStore((state) => state.isRoleAllowed);

  if (!isRoleAllowed(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}