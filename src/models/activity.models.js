import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema({
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task"
    },
    sprint: {
        type: Schema.Types.ObjectId,
        ref: "Sprint"
    },
    actor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Human-readable summary: "changed status from Todo to In Progress"
    action: {
        type: String,
        required: true
    },
    actionType: {
        type: String,
        enum: [
            "created", "updated", "deleted", "commented",
            "assigned", "unassigned",
            "status_changed", "sprint_changed",
            "priority_changed", "label_changed",
            "attachment_added", "time_logged",
            "sprint_started", "sprint_completed",
            "member_added", "member_removed",
            "approval_requested", "approval_decided"
        ],
        required: true
    },
    details: {
        type: Map,
        of: Schema.Types.Mixed
    }
}, { timestamps: true });

activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ task: 1, createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ sprint: 1, createdAt: -1 });

export const Activity = mongoose.model("Activity", activitySchema);
