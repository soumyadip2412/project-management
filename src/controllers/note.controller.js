import mongoose from "mongoose";
import { Note } from "../models/note.models.js";
import Project from "../models/project.models.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asynchandler } from "../utils/asynchandler.js";

// Helper functions for authorization
const isProjectMember = (project, userId) => {
    return project.members.some((m) => m.user.toString() === userId.toString());
};

const isProjectAdmin = (project, userId) => {
    return project.members.some(
        (m) => m.user.toString() === userId.toString() && m.role === 'admin'
    );
};

// --- NOTE OPERATIONS ---

const createNote = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, content } = req.body;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    // PRD: Note creation is Admin only
    if (!isProjectAdmin(project, req.user._id)) {
        throw new ApiError(403, "Only project admins can create notes");
    }

    const note = await Note.create({
        title,
        content,
        project: projectId,
        author: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, note, "Note created successfully"));
});

const getProjectNotes = asynchandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    // PRD: Note listing is available to members
    if (!isProjectMember(project, req.user._id)) {
        throw new ApiError(403, "Not authorized to view notes for this project");
    }

    const notes = await Note.find({ project: projectId })
        .populate("author", "fullName username email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, notes, "Project notes fetched successfully")
    );
});

const getNoteById = asynchandler(async (req, res) => {
    const { projectId, noteId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    
    if (!isProjectMember(project, req.user._id)) {
        throw new ApiError(403, "Not authorized");
    }

    const note = await Note.findOne({ _id: noteId, project: projectId })
        .populate("author", "fullName username email");

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    return res.status(200).json(new ApiResponse(200, note, "Note fetched successfully"));
});

const updateNote = asynchandler(async (req, res) => {
    const { projectId, noteId } = req.params;
    const { title, content } = req.body;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    
    // PRD: Note updates are Admin only
    if (!isProjectAdmin(project, req.user._id)) {
        throw new ApiError(403, "Only project admins can update notes");
    }

    const note = await Note.findOneAndUpdate(
        { _id: noteId, project: projectId },
        {
            $set: {
                ...(title && { title }),
                ...(content && { content })
            }
        },
        { new: true, runValidators: true }
    );

    if (!note) throw new ApiError(404, "Note not found");

    return res.status(200).json(new ApiResponse(200, note, "Note updated successfully"));
});

const deleteNote = asynchandler(async (req, res) => {
    const { projectId, noteId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    
    // PRD: Note deletion is Admin only
    if (!isProjectAdmin(project, req.user._id)) {
        throw new ApiError(403, "Only project admins can delete notes");
    }

    const note = await Note.findOneAndDelete({ _id: noteId, project: projectId });

    if (!note) throw new ApiError(404, "Note not found");

    return res.status(200).json(new ApiResponse(200, null, "Note deleted successfully"));
});

export {
    createNote,
    getProjectNotes,
    getNoteById,
    updateNote,
    deleteNote
};
