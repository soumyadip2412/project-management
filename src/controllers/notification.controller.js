import { Notification } from "../models/notification.models.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asynchandler } from "../utils/asynchandler.js";

// ─── List Notifications ──────────────────────
const getNotifications = asynchandler(async (req, res) => {
    const { page = 1, limit = 20, isRead } = req.query;
    const skip = (page - 1) * limit;

    const filter = { recipient: req.user._id };
    if (isRead !== undefined) filter.isRead = isRead === "true";

    const notifications = await Notification.find(filter)
        .populate("actor", "fullName username avatar")
        .populate("project", "name key")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            notifications,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit)
        }, "Notifications fetched")
    );
});

// ─── Unread Count ────────────────────────────
const getUnreadCount = asynchandler(async (req, res) => {
    const count = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false
    });
    return res.status(200).json(new ApiResponse(200, { unreadCount: count }, "Unread count fetched"));
});

// ─── Mark as Read ────────────────────────────
const markAsRead = asynchandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: req.user._id },
        { $set: { isRead: true, readAt: new Date() } },
        { new: true }
    );

    if (!notification) throw new ApiError(404, "Notification not found");

    return res.status(200).json(new ApiResponse(200, notification, "Marked as read"));
});

// ─── Mark All as Read ────────────────────────
const markAllAsRead = asynchandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
    );
    return res.status(200).json(new ApiResponse(200, null, "All notifications marked as read"));
});

export { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
