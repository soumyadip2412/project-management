import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  user: null,
  accessToken: null,
  hydrated: false,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      setHydrated: (hydrated) => set({ hydrated }),
      setSession: ({ user, accessToken }) => set({ user, accessToken, hydrated: true }),
      clearSession: () => set({ ...initialState, hydrated: true }),
      setUser: (user) => set({ user }),
      isAuthenticated: () => Boolean(get().user),
      isRoleAllowed: (roles = []) => {
        const user = get().user;
        if (!user) return false;
        const currentRole = user.systemRole || user.role || "member";
        if (!roles.length) return true;
        if (currentRole === "super_admin") return true;
        return roles.includes(currentRole);
      },

    }),
    {
      name: "project-camp-auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);