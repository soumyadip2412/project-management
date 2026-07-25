import { User } from "../models/user.models.js";
import { AuditLog } from "../models/auditLog.models.js";
import Project from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { Sprint } from "../models/sprint.models.js";
import Workspace from "../models/workspace.models.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asynchandler } from "../utils/asynchandler.js";

// ─── List All Users (Admin) ──────────────────
const listUsers = asynchandler(async (req, res) => {
    const { page = 1, limit = 20, search, systemRole, isActive } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
        const regex = new RegExp(search, "i");
        filter.$or = [{ fullName: regex }, { username: regex }, { email: regex }];
    }
    if (systemRole) filter.systemRole = systemRole;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const users = await User.find(filter)
        .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgetPasswordToken -forgetPasswordExpiry")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit)
        }, "Users fetched")
    );
});

// ─── Update User System Role ─────────────────
const updateUserRole = asynchandler(async (req, res) => {
    const { userId } = req.params;
    const { systemRole } = req.body;

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { systemRole } },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(
        new ApiResponse(200, user, "User role updated")
    );
});

// ─── Activate / Deactivate User ──────────────
const updateUserStatus = asynchandler(async (req, res) => {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                isActive,
                ...(isActive === false && { deactivatedAt: new Date() })
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(
        new ApiResponse(200, user, `User ${isActive ? "activated" : "deactivated"}`)
    );
});

// ─── System Analytics ────────────────────────
const getSystemAnalytics = asynchandler(async (req, res) => {
    const [totalUsers, activeUsers, totalProjects, totalTasks, totalSprints, totalWorkspaces] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        Project.countDocuments({ isArchived: false }),
        Task.countDocuments({ isArchived: false }),
        Sprint.countDocuments(),
        Workspace.countDocuments({ isActive: true })
    ]);

    // Task distribution by status
    const tasksByStatus = await Task.aggregate([
        { $match: { isArchived: { $ne: true } } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
        { $match: { isArchived: { $ne: true } } },
        { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    // Tasks by issue type
    const tasksByType = await Task.aggregate([
        { $match: { isArchived: { $ne: true } } },
        { $group: { _id: "$issueType", count: { $sum: 1 } } }
    ]);

    // Users by role
    const usersByRole = await User.aggregate([
        { $group: { _id: "$systemRole", count: { $sum: 1 } } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            overview: { totalUsers, activeUsers, totalProjects, totalTasks, totalSprints, totalWorkspaces },
            tasksByStatus,
            tasksByPriority,
            tasksByType,
            usersByRole
        }, "System analytics fetched")
    );
});

// ─── Audit Log ───────────────────────────────
const getAuditLog = asynchandler(async (req, res) => {
    const { page = 1, limit = 50, entityType, action, actorId, projectId } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;
    if (actorId) filter.actor = actorId;
    if (projectId) filter.project = projectId;

    const logs = await AuditLog.find(filter)
        .populate("actor", "fullName username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            logs,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit)
        }, "Audit log fetched")
    );
});

export { listUsers, updateUserRole, updateUserStatus, getSystemAnalytics, getAuditLog };
