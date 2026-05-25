export const APP_NAME = import.meta.env.VITE_APP_NAME || "Project Camp";

export const ROUTES = {
  landing: "/",
  login: "/auth/login",
  signup: "/auth/signup",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password/:token",
  verifyEmail: "/auth/verify-email/:token",
  dashboard: "/app/dashboard",
  projects: "/app/projects",
  analytics: "/app/analytics",
  settings: "/app/settings",
};

export const TASK_STATUSES = ["todo", "in_progress", "done"];

export const ROLE_LABELS = {
  admin: "Admin",
  project_admin: "Project Admin",
  member: "Member",
};