import { body } from "express-validator";



const userRegisterValidator =() =>{{
    return[
        body("email")
        .trim()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("Email is invalid"),
        body("username")
        .trim()
        .notEmpty()
        .withMessage("Username should not be empty")
        .isLowercase()
        .withMessage("Username must be in lowercase")
        .isLength({min:3})
        .withMessage("Username must be at least 3 characters long"),
        body("password").trim().notEmpty().withMessage("Password is required")
    ]
}}

const userLoginValidator =() =>{
    return[
        body("email")
        .optional()
        .isEmail()
        .withMessage("Email is Valid"),
        body("password")
        .notEmpty()
        .withMessage("Password is required")
    ]
}
const userChangeCurrentPasswordValidator=()=>{
    return[
        body("oldPassword")
        .notEmpty()
        .withMessage("Old password is required"),
        body("newPassword")
        .notEmpty()
        .withMessage("New Password is required"),
    ]
}

const userForgotPasswordValidator=()=>{
    return[
        body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid")

    ]//yeh wala part sirf forgot password ka hi hai 
}
const userResetForgotPasswordValidator = ()=>{//yeh hai reset ka part naya wala password dene ka hai idhar se 
    
    return[
        body("newPassword")
        .notEmpty()
        .withMessage("Password is required")
    ]
}
export  { userRegisterValidator } 
export { userLoginValidator }
export { userChangeCurrentPasswordValidator }
export { userForgotPasswordValidator }
export { userResetForgotPasswordValidator }