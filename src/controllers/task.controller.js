import mongoose from "mongoose";
import { Task } from "../models/task.models.js";
import Project from "../models/project.models.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asynchandler } from "../utils/asynchandler.js";

import { isProjectAdmin, isProjectMember } from "../utils/permissions.js";

// --- TASK OPERATIONS ---

const createTask = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, description, assignees, status, issueType, priority, storyPoints } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!isProjectMember(project, req.user._id)) {
        throw new ApiError(403, "Only project members can create tasks");
    }

    const task = await Task.create({
        title,
        description,
        project: projectId,
        assignees: assignees || [],
        issueType,
        priority,
        storyPoints,
        reporter: req.user._id,
        status: status?.name || status || 'todo'
    });

    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

const getProjectTasks = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!isProjectMember(project, req.user._id)) {
        throw new ApiError(403, "Not authorized to view tasks for this project");
    }

    const filter = { project: projectId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
        .populate("assignees", "fullName username email")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const totalTasks = await Task.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            tasks,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalTasks / limit),
            totalTasks
        }, "Project tasks fetched successfully")
    );
});

const getTaskById = asynchandler(async (req, res) => {
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    if (!isProjectMember(project, req.user._id)) throw new ApiError(403, "Not authorized");

    const task = await Task.findOne({ _id: taskId, project: projectId })
        .populate("assignees", "fullName username email");

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));
});

const updateTask = asynchandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const { title, description, assignees, status, issueType, priority, storyPoints } = req.body;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    
    // According to PRD, Admin/Project Admin can update. Let's allow members to update.
    if (!isProjectMember(project, req.user._id)) {
        throw new ApiError(403, "Only project members can update tasks");
    }

    const task = await Task.findOneAndUpdate(
        { _id: taskId, project: projectId },
        {
            $set: {
                ...(title && { title }),
                ...(description && { description }),
                ...(assignees && { assignees }),
                ...(status && { status: status?.name || status }),
                ...(issueType && { issueType }),
                ...(priority && { priority }),
                ...(storyPoints !== undefined && { storyPoints }),
            }
        },
        { new: true, runValidators: true }
    );

    if (!task) throw new ApiError(404, "Task not found");

    return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
});

const deleteTask = asynchandler(async (req, res) => {
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    
    if (!isProjectAdmin(project, req.user._id)) {
        throw new ApiError(403, "Only project admins can delete tasks");
    }

    const task = await Task.findOneAndDelete({ _id: taskId, project: projectId });

    if (!task) throw new ApiError(404, "Task not found");

    return res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"));
});

// --- SUBTASK OPERATIONS ---

const createSubtask = asynchandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const { title, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    
    if (!isProjectAdmin(project, req.user._id)) {
        throw new ApiError(403, "Only project admins can create subtasks");
    }

    const task = await Task.findOneAndUpdate(
        { _id: taskId, project: projectId },
        {
            $push: {
                subtasks: { title, status: status || 'todo' }
            }
        },
        { new: true, runValidators: true }
    );

    if (!task) throw new ApiError(404, "Task not found");

    return res.status(201).json(new ApiResponse(201, task, "Subtask created successfully"));
});

const updateSubtask = asynchandler(async (req, res) => {
    const { projectId, subTaskId } = req.params;
    const { title, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    
    // PRD says secured role-based. Any member can update status (Member completion)
    if (!isProjectMember(project, req.user._id)) {
        throw new ApiError(403, "Not authorized");
    }

    const task = await Task.findOneAndUpdate(
        { project: projectId, "subtasks._id": subTaskId },
        {
            $set: {
                ...(title && { "subtasks.$.title": title }),
                ...(status && { "subtasks.$.status": status })
            }
        },
        { new: true, runValidators: true }
    );

    if (!task) throw new ApiError(404, "Subtask not found");

    return res.status(200).json(new ApiResponse(200, task, "Subtask updated successfully"));
});

const deleteSubtask = asynchandler(async (req, res) => {
    const { projectId, subTaskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    
    if (!isProjectAdmin(project, req.user._id)) {
        throw new ApiError(403, "Only project admins can delete subtasks");
    }

    const task = await Task.findOneAndUpdate(
        { project: projectId, "subtasks._id": subTaskId },
        {
            $pull: {
                subtasks: { _id: subTaskId }
            }
        },
        { new: true }
    );

    if (!task) throw new ApiError(404, "Subtask not found");

    return res.status(200).json(new ApiResponse(200, task, "Subtask deleted successfully"));
});

export {
    createTask,
    getProjectTasks,
    getTaskById,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask
};
