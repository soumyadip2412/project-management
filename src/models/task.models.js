import mongoose, { Schema } from "mongoose";

const subTaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['todo', 'in_progress', 'done'],
        default: 'todo'
    }
}, { timestamps: true });

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        enum: ['todo', 'in_progress', 'done'],
        default: 'todo'
    },
    attachments: [{
        url: String,
        public_id: String
    }],
    subtasks: [subTaskSchema]
}, { timestamps: true });

export const Task = mongoose.model("Task", taskSchema);
