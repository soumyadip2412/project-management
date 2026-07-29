import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      currentWorkspace: null,
      workspaces: [],
      loading: false,

      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      setWorkspaces: (workspaces) => {
        set({ workspaces });
        if (!get().currentWorkspace && workspaces.length > 0) {
          set({ currentWorkspace: workspaces[0] });
        }
      },
      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [workspace, ...state.workspaces],
          currentWorkspace: workspace,
        })),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "project-camp-workspace",
      partialize: (state) => ({ currentWorkspace: state.currentWorkspace }),
    }
  )
);
