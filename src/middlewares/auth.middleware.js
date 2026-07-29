import { User } from "../models/user.models.js"
import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/api-errors.js"
import jwt from "jsonwebtoken";


export const VerifyJWT = asynchandler(async(req,res,next)=>{
    const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
    if (!token){
        throw new ApiError(401,"Unauthorised request")
    }
    try {
        const decodedtoken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedtoken?._id).
        select("-password -emailVerificationExpiry -emailVerificationToken -RefreshToken");
        if(!user){
            throw new ApiError(401,"Invalid Accesstoken")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,"Invalid Token ")
    }

})

export const verifyJWT = VerifyJWT;