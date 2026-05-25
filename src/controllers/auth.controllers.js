import {User} from "../models/user.models.js"
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-errors.js"
import { asynchandler } from "../utils/asynchandler.js"
// import { TokenExpiredError } from "jsonwebtoken"
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js"
import { use } from "react"
import { tr } from "zod/v4/locales"
import { validationResult } from "express-validator"

const generateAccessAndRefreshTokens = async (userId) =>{



    //mujhe try catch externally use karna pad rha hai kyu ki jwt ka error yahi se generate hota hai na
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        if(!user){
            throw new ApiError(404,"User not found")
        }
        console.log("User has found:",user)
        console.log("User has generateAccessToken?",typeof user.generateAccessToken)
        console.log("The accestoken is:",accessToken)

        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    }catch(error){
        console.log("The error in the generation of token is:",error)
        throw new ApiError(
            500, 
            "Something went wrong while generating access tokens."
        )
    }
}

const registerUser = asynchandler(async (req, res) => {
    const { email,fullName,password, username } = req.body;
    const existingUser = await User.findOne({
        $or: [{username},{email}]

    });
    if (existingUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        email,fullName,password,username,isEmailVerified:false
    });

    const {unHashedToken,HashedToken,tokenExpiry} = user.generateTempToken();

    user.emailVerificationToken = HashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({validateBeforeSave:false})

    await sendEmail(
        {
            email: user?.email,
            subject: "Pls verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`

            ),
        }
    )
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering a user.")

    }
    return res
    .status(201)
    .json(
        new ApiResponse(
        {user: createdUser},
        "User registered sucessfully and verification email has been sent on your email "    
    )
)
});
const getAllusers = asynchandler(async(req, res) => {
    const users = await User.find().select("-password -refreshToken -emailVerificationToken -emailVerificationexpiry")
    res.status(200).json(users);
});


const login = asynchandler(async (req , res) => {
    const{email,username,password}=req.body
    if (!username || !email){
        throw new ApiError(400,"Username and email is required")
    }
    const user = await User.findOne({email})//yeh database ka kam hai isliye await use hua hai 
    if(!user){
        throw new ApiError(400,"User not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(400,"Enter valid credentials")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select(
        "-password -emailVerificationExpiry -emailVerificationToken -RefreshToken",
    );
    const options = {
        httpOnly:true,
        secure:true
    };
    return res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(
        new ApiResponse(200,
        {user:loggedInUser,
        accessToken,refreshToken},
        "User logged in successfully"
        ))
})
const logoutuser = asynchandler(async(req,res) =>
{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        { new: true }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200, "User logged Out....")
    )
})
const getcurrentuser = asynchandler(async(req,res) =>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"User fetched successfully")
    )
})

const verifyemail = asynchandler(async(req,res) => {
    const {emailVerificationToken} = req.param
    if (!emailVerificationToken){
        throw new ApiError(400, "Email verification token is missing")
    }

    let HashedToken = crypto
    .createHash("sha256")
    .update(emailVerificationToken)
    .digest("hex")

    const user = await User.findOne({
        emailVerificationToken:HashedToken,
        emailVerificationExpiry: {$gt: Date.now()}//greater than now hai
    })
    if (!user){
        throw new ApiError(400, "Token is invalid or expired")
    }
    user.emailVerificationToken=undefined
    user.emailVerificationExpiry=undefined
    user.isEmailVerified = true
    await user.save({validateBeforeSave:false})
    return res.status(200)
    ,json(200,
        {
            isEmailVerified:true
        },
        "Email is verified"
    )
})

const resendemailverification = asynchandler(async(req,res) =>{
    const user = await User.findById(req.user?._id)
    if (!user){
        throw new ApiError(404, " User doesnt exist")
    }
    if (user.isEmailVerified) {
        throw new ApiError(409,"Email already verified")
    }
    const {unHashedToken,HashedToken,tokenExpiry} = user.generateTempToken();

    user.emailVerificationToken = HashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({validateBeforeSave:false})

    await sendEmail(
        {
            email: user?.email,
            subject: "Pls verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`

            ),
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(
          200,{},"Mail has been sent to your emailId"  
        )
    )
    

})

const refreshAccessToken = asynchandler(async(Req,res) =>{
    const incomeingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomeingRefreshToken){
        throw new ApiError(401,"Unauthorised access")
    }


    // idhar try catch isiliye use ho rha hai kyu ki mujhe particular error of jwt dikhane ka hai 
    try{
        const decodedToken = jwt.verify(incomeingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }
        if (incomeingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token expired");
        }
        const options = {
            httpOnly:true,
            secure:true
        }
        const {accessToken,refreshToken:newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
        user.refreshToken = newRefreshToken
        await user.save()
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,
                {accessToken,refreshToken:newRefreshToken},
                "Access token refreshed"
            )
        )

    } catch (error) {
        throw new ApiError(401, "Error while refreshing access token");
    }
});

const forgotpasswordrequest = asynchandler(async(req,res)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404,"User does not exists")
    }
    const { unHashedToken } = user.generateTempToken() 

    user.forgetPasswordToken = HashedToken
    user.forgetPasswordExpiry = tokenExpiry

    await user.save({validateBeforeSave:false})

    await sendEmail({
        email: user?.email,
            subject: "Password reset request",
            mailgenContent: forgotPasswordMailgenContent(
                user.username,
                `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`

            ),
    })
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},"Password reset has been sent to your email"
        )
    )
})

const resetforgotpassword = asynchandler(async(req,res)=>{
    const {resetToken} =req.param
    const {newPassword}=req.body

    let HashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

    await User.findOne({
        forgetPasswordToken:HashedToken,
        forgetPasswordExpiry:{$gt:Date.now()}
    })
    if(!user){
        throw new ApiError(489,"TOken is invalid or expired")

    }
    user.forgetPasswordExpiry = undefined
    user.forgetPasswordToken = undefined

    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200)
    .json(
        new ApiResponse(200,{
           
        },"Password reset has been successful")
    )

})

const changecurrentpassword = asynchandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(400,"Invaliud old Password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(
        new ApiResponse (200,
        {
        },"CurrentPassword has been changed.")
    )
})

export {
    login,
    logoutuser,
    registerUser,
    generateAccessAndRefreshTokens,
    getAllusers,
    getcurrentuser,
    verifyemail,
    refreshAccessToken,
    resendemailverification,
    forgotpasswordrequest,
    resetforgotpassword,
    changecurrentpassword
}
