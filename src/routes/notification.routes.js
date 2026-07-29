import { Router } from "express";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:notificationId/read", markAsRead);

export default router;
