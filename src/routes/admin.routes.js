import { Router } from "express";
import {
    listUsers,
    updateUserRole,
    updateUserStatus,
    getSystemAnalytics,
    getAuditLog
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(verifyJWT);
router.use(requireRole("super_admin", "product_manager"));

router.get("/users", listUsers);
router.put("/users/:userId/role", updateUserRole);
router.put("/users/:userId/status", updateUserStatus);
router.get("/analytics", getSystemAnalytics);
router.get("/audit-log", getAuditLog);

export default router;
