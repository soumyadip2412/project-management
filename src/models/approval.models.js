import mongoose, { Schema } from "mongoose";
import { AvailableApprovalStatuses, ApprovalStatusEnum } from "../utils/constants.js";

const approvalSchema = new Schema({
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task"
    },
    // What kind of approval
    type: {
        type: String,
        enum: ["task_completion", "deployment", "release", "design_review", "code_review", "custom"],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: { type: String, trim: true },
    // Who requested the approval
    requestedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Who needs to approve
    approvers: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: AvailableApprovalStatuses,
            default: ApprovalStatusEnum.PENDING
        },
        decidedAt: Date,
        comment: String
    }],
    // Overall status
    status: {
        type: String,
        enum: AvailableApprovalStatuses,
        default: ApprovalStatusEnum.PENDING
    },
    // Approval rules
    requireAll: { type: Boolean, default: false },  // false = any one approver is enough
    dueDate: Date,
    resolvedAt: Date
}, { timestamps: true });

approvalSchema.index({ project: 1, status: 1 });
approvalSchema.index({ "approvers.user": 1, status: 1 });
approvalSchema.index({ requestedBy: 1, createdAt: -1 });
approvalSchema.index({ task: 1 });

export const Approval = mongoose.model("Approval", approvalSchema);
