import { Task } from "../models/task.models.js";
import Project from "../models/project.models.js";
import { User } from "../models/user.models.js";
import { Note } from "../models/note.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { asynchandler } from "../utils/asynchandler.js";

// ─── Global Search ───────────────────────────
const globalSearch = asynchandler(async (req, res) => {
    const { q, type, projectId, limit = 20 } = req.query;

    if (!q || q.length < 2) {
        return res.status(200).json(new ApiResponse(200, { results: [] }, "Provide at least 2 characters"));
    }

    const results = {};
    const searchRegex = new RegExp(q, "i");
    const maxPerType = Math.min(parseInt(limit), 50);

    // Determine which types to search
    const types = type ? type.split(",") : ["task", "project", "user", "note"];

    // Get user's project IDs for scoping
    const userProjects = await Project.find({ "members.user": req.user._id }).select("_id");
    const projectIds = projectId ? [projectId] : userProjects.map(p => p._id);

    if (types.includes("task")) {
        results.tasks = await Task.find({
            project: { $in: projectIds },
            $or: [
                { title: searchRegex },
                { issueKey: searchRegex },
                { description: searchRegex }
            ],
            isArchived: { $ne: true }
        })
            .populate("project", "name key")
            .populate("assignees", "fullName username avatar")
            .select("title issueKey issueType status priority project assignees")
            .limit(maxPerType)
            .sort({ updatedAt: -1 });
    }

    if (types.includes("project")) {
        results.projects = await Project.find({
            _id: { $in: projectIds },
            $or: [
                { name: searchRegex },
                { key: searchRegex },
                { description: searchRegex }
            ]
        })
            .select("name key description status methodology")
            .limit(maxPerType);
    }

    if (types.includes("user")) {
        results.users = await User.find({
            $or: [
                { fullName: searchRegex },
                { username: searchRegex },
                { email: searchRegex }
            ],
            isActive: true
        })
            .select("fullName username email avatar systemRole department")
            .limit(maxPerType);
    }

    if (types.includes("note")) {
        results.notes = await Note.find({
            project: { $in: projectIds },
            $or: [
                { title: searchRegex },
                { content: searchRegex }
            ]
        })
            .populate("project", "name key")
            .select("title project createdAt")
            .limit(maxPerType);
    }

    return res.status(200).json(
        new ApiResponse(200, results, "Search results fetched")
    );
});

// ─── Recent Items ────────────────────────────
const getRecentItems = asynchandler(async (req, res) => {
    const userProjects = await Project.find({ "members.user": req.user._id }).select("_id");
    const projectIds = userProjects.map(p => p._id);

    const [recentTasks, recentProjects] = await Promise.all([
        Task.find({
            project: { $in: projectIds },
            $or: [
                { assignees: req.user._id },
                { reporter: req.user._id },
                { watchers: req.user._id }
            ]
        })
            .populate("project", "name key")
            .select("title issueKey issueType status priority")
            .sort({ updatedAt: -1 })
            .limit(10),

        Project.find({ _id: { $in: projectIds } })
            .select("name key status")
            .sort({ updatedAt: -1 })
            .limit(5)
    ]);

    return res.status(200).json(
        new ApiResponse(200, { recentTasks, recentProjects }, "Recent items fetched")
    );
});

export { globalSearch, getRecentItems };
