/**
 * ═══════════════════════════════════════════════
 *  RBAC MIDDLEWARE
 *  Declarative, resource-based permission checks
 *  Usage: router.post("/", rbac("task", "create"), handler)
 * ═══════════════════════════════════════════════
 */

import { ApiError } from "../utils/api-errors.js";
import { asynchandler } from "../utils/asynchandler.js";
import { hasPermission, resolveEffectiveRole } from "../utils/permissions.js";
import Project from "../models/project.models.js";
import Workspace from "../models/workspace.models.js";

/**
 * Resolve user's role context from request params.
 * Checks system role, workspace membership, and project membership.
 */
const resolvePermissionContext = async (userId, systemRole, workspaceId, projectId) => {
    const context = {
        systemRole,
        workspaceRole: null,
        projectRole: null,
        effectiveRole: systemRole || "member",
        isProjectMember: false,
        isWorkspaceMember: false,
        project: null,
        workspace: null,
    };

    // Resolve workspace context
    if (workspaceId) {
        const workspace = await Workspace.findById(workspaceId);
        if (workspace) {
            context.workspace = workspace;
            const wsMember = workspace.members.find(
                (m) => m.user.toString() === userId.toString()
            );
            if (wsMember) {
                context.workspaceRole = wsMember.role;
                context.isWorkspaceMember = true;
            }
        }
    }

    // Resolve project context
    if (projectId) {
        const project = await Project.findById(projectId);
        if (project) {
            context.project = project;
            const projMember = project.members.find(
                (m) => m.user.toString() === userId.toString()
            );
            if (projMember) {
                context.projectRole = projMember.role;
                context.isProjectMember = true;
            }

            // If no workspace was specified, use the project's workspace
            if (!workspaceId && project.workspace) {
                const workspace = await Workspace.findById(project.workspace);
                if (workspace) {
                    context.workspace = workspace;
                    const wsMember = workspace.members.find(
                        (m) => m.user.toString() === userId.toString()
                    );
                    if (wsMember) {
                        context.workspaceRole = wsMember.role;
                        context.isWorkspaceMember = true;
                    }
                }
            }
        }
    }

    // Resolve effective role
    context.effectiveRole = resolveEffectiveRole(systemRole, context.projectRole);

    return context;
};

/**
 * RBAC middleware factory.
 * @param {string} resource - The resource being accessed (e.g., "task", "project", "sprint")
 * @param {string} action - The action being performed (e.g., "create", "read", "update", "delete")
 * @returns Express middleware
 * 
 * @example
 * router.post("/", rbac("task", "create"), createTask);
 * router.get("/", rbac("task", "read"), getTasks);
 */
export const rbac = (resource, action) => {
    return asynchandler(async (req, res, next) => {
        const { user } = req;

        if (!user) {
            throw new ApiError(401, "Authentication required");
        }

        // Super admin bypasses all checks
        if (user.systemRole === "super_admin") {
            req.permissionContext = {
                systemRole: "super_admin",
                effectiveRole: "super_admin",
                isProjectMember: true,
                isWorkspaceMember: true,
            };
            return next();
        }

        const { projectId, workspaceId } = req.params;

        // Resolve full permission context
        const context = await resolvePermissionContext(
            user._id,
            user.systemRole,
            workspaceId,
            projectId
        );

        // Check permission
        if (!hasPermission(context.effectiveRole, resource, action)) {
            throw new ApiError(
                403,
                `Forbidden: You don't have permission to ${action} ${resource}. ` +
                `Your role: ${context.effectiveRole}`
            );
        }

        // For project-scoped resources, verify membership (except for system-level roles)
        if (projectId && !context.isProjectMember &&
            !["super_admin", "hr", "product_manager"].includes(user.systemRole)) {
            throw new ApiError(403, "You are not a member of this project");
        }

        // Attach context for downstream controllers
        req.permissionContext = context;
        next();
    });
};

/**
 * Quick role check middleware — for simple system-level role gates.
 * @param {...string} roles - Allowed system roles
 * 
 * @example
 * router.get("/users", requireRole("super_admin", "hr"), listUsers);
 */
export const requireRole = (...roles) => {
    return asynchandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }
        if (!roles.includes(req.user.systemRole)) {
            throw new ApiError(
                403,
                `This action requires one of these roles: ${roles.join(", ")}`
            );
        }
        next();
    });
};

/**
 * Ensure user is a member of the project in params.
 * Lighter-weight than full rbac() — just checks membership.
 */
export const requireProjectMember = asynchandler(async (req, res, next) => {
    const { projectId } = req.params;
    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const isMember = project.members.some(
        (m) => m.user.toString() === req.user._id.toString()
    );
    const isSystemPrivileged = ["super_admin", "hr", "product_manager"].includes(req.user.systemRole);

    if (!isMember && !isSystemPrivileged) {
        throw new ApiError(403, "You are not a member of this project");
    }

    req.project = project;
    next();
});
