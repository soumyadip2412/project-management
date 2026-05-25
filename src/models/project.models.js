
import mongoose,{ Schema } from "mongoose";


const projectSchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members:[{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        role:{
            type: String,
            enum:["admin","member"],
            default:"member"
        }
    }]
}, { timestamps: true }
);


const Project = mongoose.model("Project", projectSchema);

export default Project;
