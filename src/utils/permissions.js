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

/**
 * Enterprise Permission Matrix
 */
export const RolePermissions = {
  super_admin: ["*:*"],
  org_admin: [
    "workspace:*",
    "project:*",
    "sprint:*",
    "task:*",
    "comment:*",
    "note:*",
    "label:*"
  ],
  admin: [
    "workspace:read",
    "project:*",
    "sprint:*",
    "task:*",
    "comment:*",
    "note:*",
    "label:*"
  ],
  maintainer: [
    "workspace:read",
    "project:read",
    "sprint:*",
    "task:create",
    "task:read",
    "task:update",
    "task:assign",
    "task:move",
    "comment:*",
    "note:*",
    "label:*"
  ],
  developer: [
    "workspace:read",
    "project:read",
    "sprint:read",
    "task:create",
    "task:read",
    "task:update",
    "comment:create",
    "comment:read",
    "comment:update_own",
    "note:read",
    "label:read"
  ],
  viewer: [
    "workspace:read",
    "project:read",
    "sprint:read",
    "task:read",
    "comment:read",
    "note:read",
    "label:read"
  ],
  member: [
    "workspace:read",
    "project:read",
    "sprint:read",
    "task:read",
    "comment:read"
  ]
};

/**
 * Resolves user's effective role combining system and project role
 */
export const resolveEffectiveRole = (systemRole, projectRole) => {
  if (systemRole === SystemRolesEnum.SUPER_ADMIN || systemRole === "super_admin") return "super_admin";
  if (systemRole === SystemRolesEnum.ORG_ADMIN || systemRole === "org_admin") return "org_admin";
  if (projectRole) return projectRole;
  return systemRole || "member";
};

/**
 * Checks if effective role has permission for resource:action
 */
export const hasPermission = (role, resource, action) => {
  const permissions = RolePermissions[role] || RolePermissions["member"];
  if (!permissions) return false;
  if (permissions.includes("*:*")) return true;

  const targetPerm = `${resource}:${action}`;
  const wildcardResource = `${resource}:*`;

  return permissions.includes(targetPerm) || permissions.includes(wildcardResource);
};

