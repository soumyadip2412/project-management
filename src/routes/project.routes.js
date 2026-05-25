import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import {
    createProject,
    getUserProjects,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    getProjectMembers,
    addMemberToProject,
    updateMemberRole,
    removeMemberFromProject
} from "../controllers/project.controller.js";

const router = Router();

// Apply VerifyJWT middleware to all routes
router.use(VerifyJWT);

// Project core routes
router.route("/")
    .post(createProject)
    .get(getUserProjects);

router.route("/all")
    .get(getAllProjects);

router.route("/:projectId")
    .get(getProjectById)
    .put(updateProject)
    .delete(deleteProject);

// Project members routes
router.route("/:projectId/members")
    .get(getProjectMembers)
    .post(addMemberToProject);

router.route("/:projectId/members/:userId")
    .put(updateMemberRole)
    .delete(removeMemberFromProject);

export default router;
