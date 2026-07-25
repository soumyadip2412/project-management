import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(VerifyJWT);

router.route("/stats").get(getDashboardStats);

export default router;
