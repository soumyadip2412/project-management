import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  return {
    user,
    accessToken,
    hydrated,
    setSession,
    clearSession,
    isAuthenticated: Boolean(user),
  };
}