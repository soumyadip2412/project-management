import { create } from "zustand";

export const useTaskStore = create((set) => ({
  tasks: [],
  selectedTask: null,
  isDetailOpen: false,
  isCreateOpen: false,
  createDefaultStatus: "todo",
  filters: {
    search: "",
    assignee: "all",
    priority: "all",
    issueType: "all",
  },

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTaskInStore: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
      selectedTask:
        state.selectedTask?._id === updatedTask._id ? updatedTask : state.selectedTask,
    })),
  removeTaskFromStore: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== taskId),
      selectedTask: state.selectedTask?._id === taskId ? null : state.selectedTask,
      isDetailOpen: state.selectedTask?._id === taskId ? false : state.isDetailOpen,
    })),

  setSelectedTask: (task) => set({ selectedTask: task, isDetailOpen: Boolean(task) }),
  closeDetail: () => set({ selectedTask: null, isDetailOpen: false }),

  openCreateModal: (defaultStatus = "todo") =>
    set({ isCreateOpen: true, createDefaultStatus: defaultStatus }),
  closeCreateModal: () => set({ isCreateOpen: false }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () =>
    set({
      filters: { search: "", assignee: "all", priority: "all", issueType: "all" },
    }),
}));
