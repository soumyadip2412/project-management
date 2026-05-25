import { Router } from "express";
import { healthCheck } from "../controllers/controller_healthcheck.js";
const router = Router()

router.route("/").get(healthCheck)


export default router //default export ko  kuch bhi name dekar import kar skte hai jaise healthCheckRouters use hua idhar app.js mein 