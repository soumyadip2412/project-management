import mongoose, { Schema } from "mongoose";

const labelSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        required: true
    },
    description: { type: String, trim: true },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

labelSchema.index({ project: 1, name: 1 }, { unique: true });

export const Label = mongoose.model("Label", labelSchema);
