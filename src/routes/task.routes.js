import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import {
    createTask,
    getProjectTasks,
    getTaskById,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask
} from "../controllers/task.controller.js";

const router = Router();

// Apply VerifyJWT middleware to all routes
router.use(VerifyJWT);

// Task core routes
router.route("/:projectId")
    .get(getProjectTasks)
    .post(createTask);

router.route("/:projectId/t/:taskId")
    .get(getTaskById)
    .put(updateTask)
    .delete(deleteTask);

// Subtask routes
router.route("/:projectId/t/:taskId/subtasks")
    .post(createSubtask);

router.route("/:projectId/st/:subTaskId")
    .put(updateSubtask)
    .delete(deleteSubtask);

export default router;
