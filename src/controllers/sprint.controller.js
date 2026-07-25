import { Sprint } from "../models/sprint.models.js";
import { Task } from "../models/task.models.js";
import Project from "../models/project.models.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asynchandler } from "../utils/asynchandler.js";
import { eventBus, Events } from "../events/eventBus.js";

// ─── Create Sprint ───────────────────────────
const createSprint = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, goal, startDate, endDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    // Count existing sprints for auto-naming
    const sprintCount = await Sprint.countDocuments({ project: projectId });

    const sprint = await Sprint.create({
        name: name || `Sprint ${sprintCount + 1}`,
        project: projectId,
        goal,
        startDate,
        endDate,
        createdBy: req.user._id,
        order: sprintCount
    });

    eventBus.safeEmit(Events.SPRINT_CREATED, { sprint, project, actor: req.user });

    return res.status(201).json(
        new ApiResponse(201, sprint, "Sprint created successfully")
    );
});

// ─── List Sprints ────────────────────────────
const getProjectSprints = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    const { status } = req.query;

    const filter = { project: projectId };
    if (status) filter.status = status;

    const sprints = await Sprint.find(filter)
        .populate("createdBy", "fullName username avatar")
        .sort({ order: 1, createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, sprints, "Sprints fetched successfully")
    );
});

// ─── Get Sprint by ID ────────────────────────
const getSprintById = asynchandler(async (req, res) => {
    const { projectId, sprintId } = req.params;

    const sprint = await Sprint.findOne({ _id: sprintId, project: projectId })
        .populate("createdBy", "fullName username avatar");

    if (!sprint) throw new ApiError(404, "Sprint not found");

    // Get sprint issues
    const issues = await Task.find({ sprint: sprintId })
        .populate("assignees", "fullName username avatar")
        .populate("reporter", "fullName username avatar")
        .sort({ priority: 1, createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, { sprint, issues }, "Sprint details fetched")
    );
});

// ─── Update Sprint ───────────────────────────
const updateSprint = asynchandler(async (req, res) => {
    const { projectId, sprintId } = req.params;
    const { name, goal, startDate, endDate } = req.body;

    const sprint = await Sprint.findOneAndUpdate(
        { _id: sprintId, project: projectId },
        { $set: { ...(name && { name }), ...(goal && { goal }), ...(startDate && { startDate }), ...(endDate && { endDate }) } },
        { new: true, runValidators: true }
    );

    if (!sprint) throw new ApiError(404, "Sprint not found");

    return res.status(200).json(
        new ApiResponse(200, sprint, "Sprint updated successfully")
    );
});

// ─── Start Sprint ────────────────────────────
const startSprint = asynchandler(async (req, res) => {
    const { projectId, sprintId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    // Check no other active sprint exists
    const activeSprint = await Sprint.findOne({ project: projectId, status: "active" });
    if (activeSprint) {
        throw new ApiError(400, `Sprint "${activeSprint.name}" is already active. Complete it first.`);
    }

    const sprint = await Sprint.findOneAndUpdate(
        { _id: sprintId, project: projectId, status: "planned" },
        { $set: { status: "active", startDate: new Date() } },
        { new: true }
    );

    if (!sprint) throw new ApiError(404, "Sprint not found or already started");

    // Compute initial burndown snapshot
    const issues = await Task.find({ sprint: sprintId });
    const totalPoints = issues.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = issues
        .filter(t => t.statusCategory === "done")
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    sprint.burndownData.push({
        date: new Date(),
        totalPoints,
        completedPoints,
        remainingPoints: totalPoints - completedPoints,
        addedPoints: 0
    });
    sprint.summary.totalIssues = issues.length;
    sprint.summary.totalStoryPoints = totalPoints;
    await sprint.save();

    eventBus.safeEmit(Events.SPRINT_STARTED, { sprint, project, actor: req.user });

    return res.status(200).json(
        new ApiResponse(200, sprint, "Sprint started successfully")
    );
});

// ─── Complete Sprint ─────────────────────────
const completeSprint = asynchandler(async (req, res) => {
    const { projectId, sprintId } = req.params;
    const { moveIncompleteToSprint } = req.body; // optional: ID of next sprint

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    const sprint = await Sprint.findOne({ _id: sprintId, project: projectId, status: "active" });
    if (!sprint) throw new ApiError(404, "No active sprint found with this ID");

    // Calculate final stats
    const issues = await Task.find({ sprint: sprintId });
    const completedIssues = issues.filter(t => t.statusCategory === "done");
    const incompleteIssues = issues.filter(t => t.statusCategory !== "done");

    const completedPoints = completedIssues.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const totalPoints = issues.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    sprint.status = "completed";
    sprint.completedAt = new Date();
    sprint.velocity = completedPoints;
    sprint.summary = {
        totalIssues: issues.length,
        completedIssues: completedIssues.length,
        incompleteIssues: incompleteIssues.length,
        totalStoryPoints: totalPoints,
        completedStoryPoints: completedPoints,
        addedDuringSprint: sprint.burndownData.reduce((sum, d) => sum + (d.addedPoints || 0), 0)
    };

    // Final burndown snapshot
    sprint.burndownData.push({
        date: new Date(),
        totalPoints,
        completedPoints,
        remainingPoints: totalPoints - completedPoints,
        addedPoints: 0
    });

    await sprint.save();

    // Move incomplete issues to next sprint or backlog
    if (moveIncompleteToSprint) {
        await Task.updateMany(
            { _id: { $in: incompleteIssues.map(i => i._id) } },
            { $set: { sprint: moveIncompleteToSprint } }
        );
    } else {
        // Move to backlog (remove sprint reference)
        await Task.updateMany(
            { _id: { $in: incompleteIssues.map(i => i._id) } },
            { $unset: { sprint: "" }, $set: { status: "backlog", statusCategory: "todo" } }
        );
    }

    eventBus.safeEmit(Events.SPRINT_COMPLETED, { sprint, project, actor: req.user });

    return res.status(200).json(
        new ApiResponse(200, sprint, "Sprint completed successfully")
    );
});

// ─── Delete Sprint ───────────────────────────
const deleteSprint = asynchandler(async (req, res) => {
    const { projectId, sprintId } = req.params;

    const sprint = await Sprint.findOne({ _id: sprintId, project: projectId });
    if (!sprint) throw new ApiError(404, "Sprint not found");
    if (sprint.status === "active") {
        throw new ApiError(400, "Cannot delete an active sprint. Complete or cancel it first.");
    }

    // Move sprint's issues to backlog
    await Task.updateMany(
        { sprint: sprintId },
        { $unset: { sprint: "" }, $set: { status: "backlog", statusCategory: "todo" } }
    );

    await sprint.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "Sprint deleted successfully")
    );
});

// ─── Get Burndown Data ───────────────────────
const getBurndownData = asynchandler(async (req, res) => {
    const { projectId, sprintId } = req.params;

    const sprint = await Sprint.findOne({ _id: sprintId, project: projectId });
    if (!sprint) throw new ApiError(404, "Sprint not found");

    return res.status(200).json(
        new ApiResponse(200, {
            burndownData: sprint.burndownData,
            summary: sprint.summary,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            velocity: sprint.velocity
        }, "Burndown data fetched")
    );
});

// ─── Get Velocity Data (across sprints) ──────
const getVelocityData = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    const { limit = 10 } = req.query;

    const completedSprints = await Sprint.find({
        project: projectId,
        status: "completed"
    })
        .sort({ completedAt: -1 })
        .limit(parseInt(limit))
        .select("name velocity summary completedAt");

    const velocityData = completedSprints.reverse().map(s => ({
        sprintName: s.name,
        velocity: s.velocity,
        committed: s.summary.totalStoryPoints,
        completed: s.summary.completedStoryPoints,
        completedAt: s.completedAt
    }));

    const avgVelocity = velocityData.length > 0
        ? Math.round(velocityData.reduce((sum, d) => sum + d.velocity, 0) / velocityData.length)
        : 0;

    return res.status(200).json(
        new ApiResponse(200, { velocityData, avgVelocity }, "Velocity data fetched")
    );
});

export {
    createSprint,
    getProjectSprints,
    getSprintById,
    updateSprint,
    startSprint,
    completeSprint,
    deleteSprint,
    getBurndownData,
    getVelocityData
};
