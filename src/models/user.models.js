
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { AvailableSystemRoles, SystemRolesEnum } from "../utils/constants.js";

const userSchema = new Schema({
    avatar:{
        type: {
            URL:String,
            LocalPath:String
        },
        default:{
            URL:`https://placehold.co/300x200`,
            LocalPath:""
        },
    },
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName:{
        type: String,
        required: true,
        trim: true
    },
    password:{
        type: String,
        required: [true,"Pls enter a valid password"]
    },

    // ─── Enterprise Extensions ───────────────
    systemRole: {
        type: String,
        enum: AvailableSystemRoles,
        default: SystemRolesEnum.MEMBER
    },
    department: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
    phone: { type: String, trim: true },
    timezone: { type: String, default: "Asia/Kolkata" },
    locale: { type: String, default: "en" },

    // Activity Tracking
    lastLoginAt: { type: Date },
    loginCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    deactivatedAt: { type: Date },

    // User Preferences
    preferences: {
        theme: {
            type: String,
            enum: ["light", "dark", "system"],
            default: "system"
        },
        notifications: {
            email: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true },
            push: { type: Boolean, default: false }
        },
        defaultProjectView: {
            type: String,
            enum: ["board", "list", "timeline"],
            default: "board"
        },
        density: {
            type: String,
            enum: ["comfortable", "compact"],
            default: "comfortable"
        }
    },

    // ─── Existing Auth Fields ────────────────
    isEmailVerified:{
        type: Boolean,
        default: false
    },
    refreshToken:{
        type: String
    },
    forgetPasswordToken:{
        type: String
    },
    forgetPasswordExpiry:{
        type: Date
    },
    emailVerificationToken:{
        type: String
    },
    emailVerificationExpiry:{
        type: Date
    }
},
{
    timestamps: true,
}
)

// ─── Indexes ─────────────────────────────────
userSchema.index({ systemRole: 1 });
userSchema.index({ isActive: 1, systemRole: 1 });

// ─── Existing Methods (preserved) ────────────
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}//controller mein bhi likh skte hai 

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        systemRole: this.systemRole,
        // username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
)
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
        // email: this.email,
        // username: this.username
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
)
}

userSchema.methods.generateTempToken=function(){
    const unHashedToken= crypto.randomBytes(20).toString("hex")

    const HashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex")


    const tokenExpiry = Date.now() + (20*60*1000) //20mins
    return{unHashedToken,HashedToken,tokenExpiry}
}

export const User = mongoose.model("User", userSchema)