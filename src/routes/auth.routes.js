import { Router } from "express";
import { registerUser, getAllusers, login, logoutuser, verifyemail, refreshAccessToken, forgotpasswordrequest,resetforgotpassword,getcurrentuser,changecurrentpassword,resendemailverification, checkEmailAvailability } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userLoginValidator, userRegisterValidator,userChangeCurrentPasswordValidator,userForgotPasswordValidator,userResetForgotPasswordValidator } from "../validators/validator.index.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
// import { verify } from "jsonwebtoken";
const router = Router()

//unsecured routes
router.route("/check-email").get(checkEmailAvailability);
router.route("/register").post(userRegisterValidator(),validate,registerUser);
router.route("/users").get(getAllusers);
router.route("/login").post(userLoginValidator(),validate,login)
router.route("/verify-email/:emailVerificationToken").get(verifyemail)//idhar req.param lagega isiliye 
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotpasswordrequest)
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(),validate,resetforgotpassword)



//secured routes 
router.route("/logout").post(VerifyJWT,logoutuser)
router.route("/current-user").post(VerifyJWT,getcurrentuser)
router.route("/change-password").post(VerifyJWT,userChangeCurrentPasswordValidator(),validate,changecurrentpassword)
router.route("/resend-email-verification").post(VerifyJWT,resendemailverification)

export default router //default export ko  kuch bhi name dekar import kar skte hai jaise healthCheckRouters use hua idhar app.js mein 