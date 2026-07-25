/**
 * Event Handlers — wire up side effects
 * Import this file once in app.js to activate all handlers.
 */

import { eventBus, Events } from "../eventBus.js";
import { Notification } from "../../models/notification.models.js";
import { Activity } from "../../models/activity.models.js";
import logger from "../../utils/logger.js";

// ─── Notification Handlers ───────────────────

eventBus.on(Events.TASK_ASSIGNED, async ({ task, assigneeId, actor }) => {
    try {
        if (assigneeId.toString() === actor._id.toString()) return; // Don't notify self
        await Notification.create({
            recipient: assigneeId,
            type: "task_assigned",
            title: `${actor.fullName} assigned you to ${task.issueKey || task.title}`,
            body: task.title,
            entityType: "task",
            entityId: task._id,
            project: task.project,
            actor: actor._id,
        });
    } catch (err) {
        logger.error("Notification handler error (task_assigned):", err);
    }
});

eventBus.on(Events.TASK_STATUS_CHANGED, async ({ task, oldStatus, newStatus, actor }) => {
    try {
        // Notify all watchers + assignees
        const recipients = new Set([
            ...task.watchers?.map(w => w.toString()) || [],
            ...task.assignees?.map(a => a.toString()) || [],
        ]);
        recipients.delete(actor._id.toString()); // Don't notify the actor

        for (const recipientId of recipients) {
            await Notification.create({
                recipient: recipientId,
                type: "task_status_changed",
                title: `${actor.fullName} changed ${task.issueKey || task.title}: ${oldStatus} → ${newStatus}`,
                entityType: "task",
                entityId: task._id,
                project: task.project,
                actor: actor._id,
            });
        }
    } catch (err) {
        logger.error("Notification handler error (status_changed):", err);
    }
});

eventBus.on(Events.COMMENT_CREATED, async ({ comment, task, actor }) => {
    try {
        // Notify mentioned users
        for (const mentionedId of comment.mentions || []) {
            if (mentionedId.toString() === actor._id.toString()) continue;
            await Notification.create({
                recipient: mentionedId,
                type: "comment_mentioned",
                title: `${actor.fullName} mentioned you in ${task.issueKey || task.title}`,
                body: comment.body?.substring(0, 200),
                entityType: "task",
                entityId: task._id,
                project: task.project,
                actor: actor._id,
            });
        }

        // Notify task assignees about new comments
        for (const assigneeId of task.assignees || []) {
            if (assigneeId.toString() === actor._id.toString()) continue;
            if (comment.mentions?.some(m => m.toString() === assigneeId.toString())) continue;
            await Notification.create({
                recipient: assigneeId,
                type: "comment_added",
                title: `${actor.fullName} commented on ${task.issueKey || task.title}`,
                body: comment.body?.substring(0, 200),
                entityType: "task",
                entityId: task._id,
                project: task.project,
                actor: actor._id,
            });
        }
    } catch (err) {
        logger.error("Notification handler error (comment_created):", err);
    }
});

eventBus.on(Events.SPRINT_STARTED, async ({ sprint, project, actor }) => {
    try {
        for (const member of project.members || []) {
            if (member.user.toString() === actor._id.toString()) continue;
            await Notification.create({
                recipient: member.user,
                type: "sprint_started",
                title: `Sprint "${sprint.name}" has started`,
                entityType: "sprint",
                entityId: sprint._id,
                project: project._id,
                actor: actor._id,
            });
        }
    } catch (err) {
        logger.error("Notification handler error (sprint_started):", err);
    }
});

eventBus.on(Events.APPROVAL_REQUESTED, async ({ approval, actor }) => {
    try {
        for (const approver of approval.approvers || []) {
            await Notification.create({
                recipient: approver.user,
                type: "approval_requested",
                title: `${actor.fullName} requested your approval: ${approval.title}`,
                entityType: "approval",
                entityId: approval._id,
                project: approval.project,
                actor: actor._id,
            });
        }
    } catch (err) {
        logger.error("Notification handler error (approval_requested):", err);
    }
});

// ─── Activity Feed Handlers ──────────────────

eventBus.on(Events.TASK_CREATED, async ({ task, actor }) => {
    try {
        await Activity.create({
            project: task.project,
            task: task._id,
            actor: actor._id,
            action: `created ${task.issueType || "task"} "${task.title}"`,
            actionType: "created",
            details: { issueKey: task.issueKey, issueType: task.issueType },
        });
    } catch (err) {
        logger.error("Activity handler error (task_created):", err);
    }
});

eventBus.on(Events.TASK_STATUS_CHANGED, async ({ task, oldStatus, newStatus, actor }) => {
    try {
        await Activity.create({
            project: task.project,
            task: task._id,
            actor: actor._id,
            action: `changed status from "${oldStatus}" to "${newStatus}"`,
            actionType: "status_changed",
            details: { oldStatus, newStatus, issueKey: task.issueKey },
        });
    } catch (err) {
        logger.error("Activity handler error (status_changed):", err);
    }
});

eventBus.on(Events.TASK_ASSIGNED, async ({ task, assigneeId, actor }) => {
    try {
        await Activity.create({
            project: task.project,
            task: task._id,
            actor: actor._id,
            action: `assigned task to a team member`,
            actionType: "assigned",
            details: { assigneeId, issueKey: task.issueKey },
        });
    } catch (err) {
        logger.error("Activity handler error (task_assigned):", err);
    }
});

eventBus.on(Events.SPRINT_STARTED, async ({ sprint, project, actor }) => {
    try {
        await Activity.create({
            project: project._id,
            sprint: sprint._id,
            actor: actor._id,
            action: `started sprint "${sprint.name}"`,
            actionType: "sprint_started",
            details: { sprintName: sprint.name, startDate: sprint.startDate, endDate: sprint.endDate },
        });
    } catch (err) {
        logger.error("Activity handler error (sprint_started):", err);
    }
});

eventBus.on(Events.SPRINT_COMPLETED, async ({ sprint, project, actor }) => {
    try {
        await Activity.create({
            project: project._id,
            sprint: sprint._id,
            actor: actor._id,
            action: `completed sprint "${sprint.name}" — velocity: ${sprint.velocity} pts`,
            actionType: "sprint_completed",
            details: { sprintName: sprint.name, velocity: sprint.velocity, summary: sprint.summary },
        });
    } catch (err) {
        logger.error("Activity handler error (sprint_completed):", err);
    }
});

eventBus.on(Events.COMMENT_CREATED, async ({ comment, task, actor }) => {
    try {
        await Activity.create({
            project: task.project,
            task: task._id,
            actor: actor._id,
            action: `commented on ${task.issueKey || task.title}`,
            actionType: "commented",
            details: { commentId: comment._id, preview: comment.body?.substring(0, 100) },
        });
    } catch (err) {
        logger.error("Activity handler error (comment_created):", err);
    }
});

eventBus.on(Events.PROJECT_MEMBER_ADDED, async ({ project, memberId, role, actor }) => {
    try {
        await Activity.create({
            project: project._id,
            actor: actor._id,
            action: `added a new member as ${role}`,
            actionType: "member_added",
            details: { memberId, role },
        });
    } catch (err) {
        logger.error("Activity handler error (member_added):", err);
    }
});

logger.info("✅ Event handlers registered");
