import { ProjectRolesEnum, WorkspaceRolesEnum, SystemRolesEnum } from "./constants.js";

/**
 * Check if user is the project owner
 */
export const isProjectOwner = (project, userId) => {
  if (!project || !project.owner || !userId) return false;
  return project.owner.toString() === userId.toString();
};

/**
 * Check if user is a project admin or project manager
 */
export const isProjectAdmin = (project, userId) => {
  if (!project || !project.members || !userId) return false;
  return project.members.some(
    (m) =>
      m.user &&
      m.user.toString() === userId.toString() &&
      (m.role === "admin" ||
        m.role === ProjectRolesEnum.PROJECT_MANAGER ||
        m.role === "project_manager")
  );
};

/**
 * Check if user is any member of the project
 */
export const isProjectMember = (project, userId) => {
  if (!project || !project.members || !userId) return false;
  return project.members.some(
    (m) => m.user && m.user.toString() === userId.toString()
  );
};

/**
 * Check if user has administrative permissions over a project (Owner, Admin/Manager, or System Admin)
 */
export const canManageProject = (project, user) => {
  if (!project || !user) return false;
  const userId = user._id;

  if (user.systemRole === SystemRolesEnum.SUPER_ADMIN || user.role === "admin") {
    return true;
  }

  return isProjectOwner(project, userId) || isProjectAdmin(project, userId);
};
