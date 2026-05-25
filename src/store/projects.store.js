import { create } from "zustand";

export const useProjectStore = create((set) => ({
  activeProjectId: null,
  selectedTaskId: null,
  taskFilters: {
    search: "",
    assignee: "all",
    status: "all",
    priority: "all",
  },
  setActiveProjectId: (activeProjectId) => set({ activeProjectId }),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
  setTaskFilters: (patch) => set((state) => ({ taskFilters: { ...state.taskFilters, ...patch } })),
}));