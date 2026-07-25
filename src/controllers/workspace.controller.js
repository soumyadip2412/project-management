import Workspace from "../models/workspace.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asynchandler } from "../utils/asynchandler.js";

// ─── Create Workspace ────────────────────────
const createWorkspace = asynchandler(async (req, res) => {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existingSlug = await Workspace.findOne({ slug });
    if (existingSlug) throw new ApiError(409, "Workspace with this name already exists");

    const workspace = await Workspace.create({
        name,
        slug,
        description,
        owner: req.user._id,
        members: [{ user: req.user._id, role: "owner", joinedAt: new Date() }]
    });

    return res.status(201).json(
        new ApiResponse(201, workspace, "Workspace created successfully")
    );
});

// ─── Get User's Workspaces ───────────────────
const getUserWorkspaces = asynchandler(async (req, res) => {
    const workspaces = await Workspace.find({ "members.user": req.user._id })
        .populate("owner", "fullName username avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, workspaces, "Workspaces fetched")
    );
});

// ─── Get Workspace by ID ─────────────────────
const getWorkspaceById = asynchandler(async (req, res) => {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById(workspaceId)
        .populate("owner", "fullName username avatar")
        .populate("members.user", "fullName username avatar email");

    if (!workspace) throw new ApiError(404, "Workspace not found");

    return res.status(200).json(
        new ApiResponse(200, workspace, "Workspace fetched")
    );
});

// ─── Update Workspace ────────────────────────
const updateWorkspace = asynchandler(async (req, res) => {
    const { workspaceId } = req.params;
    const { name, description, settings } = req.body;

    const workspace = await Workspace.findByIdAndUpdate(
        workspaceId,
        {
            $set: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(settings && { settings })
            }
        },
        { new: true, runValidators: true }
    );

    if (!workspace) throw new ApiError(404, "Workspace not found");

    return res.status(200).json(
        new ApiResponse(200, workspace, "Workspace updated")
    );
});

// ─── Invite Member ───────────────────────────
const inviteMember = asynchandler(async (req, res) => {
    const { workspaceId } = req.params;
    const { email, role = "member" } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new ApiError(404, "Workspace not found");

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) throw new ApiError(404, "User not found with this email");

    const alreadyMember = workspace.members.some(
        m => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) throw new ApiError(400, "User is already a workspace member");

    workspace.members.push({
        user: userToAdd._id,
        role,
        joinedAt: new Date(),
        invitedBy: req.user._id
    });
    await workspace.save();

    return res.status(200).json(
        new ApiResponse(200, workspace, "Member invited successfully")
    );
});

// ─── Remove Member ───────────────────────────
const removeMember = asynchandler(async (req, res) => {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new ApiError(404, "Workspace not found");

    if (workspace.owner.toString() === userId) {
        throw new ApiError(400, "Cannot remove the workspace owner");
    }

    workspace.members = workspace.members.filter(
        m => m.user.toString() !== userId
    );
    await workspace.save();

    return res.status(200).json(
        new ApiResponse(200, workspace, "Member removed")
    );
});

// ─── Update Member Role ──────────────────────
const updateMemberRole = asynchandler(async (req, res) => {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new ApiError(404, "Workspace not found");

    const member = workspace.members.find(m => m.user.toString() === userId);
    if (!member) throw new ApiError(404, "Member not found");

    if (member.role === "owner") {
        throw new ApiError(400, "Cannot change owner's role");
    }

    member.role = role;
    await workspace.save();

    return res.status(200).json(
        new ApiResponse(200, workspace, "Member role updated")
    );
});

export {
    createWorkspace,
    getUserWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    inviteMember,
    removeMember,
    updateMemberRole
};
