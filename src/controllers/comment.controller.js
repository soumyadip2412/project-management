import { Comment } from "../models/comment.models.js";
import { Task } from "../models/task.models.js";
import Project from "../models/project.models.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asynchandler } from "../utils/asynchandler.js";
import { eventBus, Events } from "../events/eventBus.js";

/**
 * Extract @mentions from comment body.
 * Expects format: @username or @userId
 */
const extractMentions = (body) => {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const matches = [];
    let match;
    while ((match = mentionRegex.exec(body)) !== null) {
        matches.push(match[1]);
    }
    return matches;
};

// ─── Create Comment ──────────────────────────
const createComment = asynchandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const { body, bodyHtml, parentComment } = req.body;

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) throw new ApiError(404, "Task not found");

    // Resolve mentions
    const mentionUsernames = extractMentions(body);
    // We store usernames for now; resolution to IDs can be done via lookup
    // For simplicity, we'll store them and let the frontend resolve

    const comment = await Comment.create({
        body,
        bodyHtml,
        task: taskId,
        project: projectId,
        author: req.user._id,
        parentComment: parentComment || null,
        mentions: [],  // Populated after user resolution
    });

    // Populate for response
    const populatedComment = await Comment.findById(comment._id)
        .populate("author", "fullName username avatar")
        .populate("parentComment");

    eventBus.safeEmit(Events.COMMENT_CREATED, {
        comment: populatedComment,
        task,
        actor: req.user
    });

    return res.status(201).json(
        new ApiResponse(201, populatedComment, "Comment created successfully")
    );
});

// ─── List Comments for a Task ────────────────
const getTaskComments = asynchandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const comments = await Comment.find({
        task: taskId,
        project: projectId,
        isDeleted: false,
        parentComment: null  // top-level only
    })
        .populate("author", "fullName username avatar")
        .populate("mentions", "fullName username")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Fetch replies for each top-level comment
    const commentIds = comments.map(c => c._id);
    const replies = await Comment.find({
        parentComment: { $in: commentIds },
        isDeleted: false
    })
        .populate("author", "fullName username avatar")
        .sort({ createdAt: 1 });

    // Group replies by parent
    const repliesByParent = {};
    replies.forEach(r => {
        const parentId = r.parentComment.toString();
        if (!repliesByParent[parentId]) repliesByParent[parentId] = [];
        repliesByParent[parentId].push(r);
    });

    const commentsWithReplies = comments.map(c => ({
        ...c.toObject(),
        replies: repliesByParent[c._id.toString()] || []
    }));

    const totalComments = await Comment.countDocuments({
        task: taskId,
        project: projectId,
        isDeleted: false,
        parentComment: null
    });

    return res.status(200).json(
        new ApiResponse(200, {
            comments: commentsWithReplies,
            totalComments,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalComments / limit)
        }, "Comments fetched successfully")
    );
});

// ─── Update Comment ──────────────────────────
const updateComment = asynchandler(async (req, res) => {
    const { commentId } = req.params;
    const { body, bodyHtml } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    // Only author can edit (unless admin)
    if (comment.author.toString() !== req.user._id.toString() &&
        !["super_admin", "product_manager"].includes(req.user.systemRole)) {
        throw new ApiError(403, "You can only edit your own comments");
    }

    comment.body = body || comment.body;
    comment.bodyHtml = bodyHtml || comment.bodyHtml;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    const populated = await Comment.findById(comment._id)
        .populate("author", "fullName username avatar");

    return res.status(200).json(
        new ApiResponse(200, populated, "Comment updated successfully")
    );
});

// ─── Delete Comment (soft delete) ────────────
const deleteComment = asynchandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    // Author or admin can delete
    if (comment.author.toString() !== req.user._id.toString() &&
        !["super_admin", "product_manager"].includes(req.user.systemRole)) {
        const ctx = req.permissionContext;
        if (!ctx || !["project_manager"].includes(ctx.projectRole)) {
            throw new ApiError(403, "You can only delete your own comments");
        }
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
});

// ─── Add Reaction ────────────────────────────
const addReaction = asynchandler(async (req, res) => {
    const { commentId } = req.params;
    const { emoji } = req.body;

    if (!emoji) throw new ApiError(400, "Emoji is required");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    // Check if user already reacted with this emoji
    const existingReaction = comment.reactions.find(r => r.emoji === emoji);

    if (existingReaction) {
        const userIndex = existingReaction.users.findIndex(
            u => u.toString() === req.user._id.toString()
        );
        if (userIndex > -1) {
            // Remove reaction (toggle off)
            existingReaction.users.splice(userIndex, 1);
            if (existingReaction.users.length === 0) {
                comment.reactions = comment.reactions.filter(r => r.emoji !== emoji);
            }
        } else {
            existingReaction.users.push(req.user._id);
        }
    } else {
        comment.reactions.push({ emoji, users: [req.user._id] });
    }

    await comment.save();

    return res.status(200).json(
        new ApiResponse(200, comment, "Reaction toggled")
    );
});

export {
    createComment,
    getTaskComments,
    updateComment,
    deleteComment,
    addReaction
};
