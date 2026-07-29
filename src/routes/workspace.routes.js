import { Router } from "express";
import {
    createWorkspace,
    getUserWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    inviteMember,
    removeMember,
    updateMemberRole
} from "../controllers/workspace.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createWorkspace)
    .get(getUserWorkspaces);

router.route("/:workspaceId")
    .get(getWorkspaceById)
    .put(updateWorkspace);

router.route("/:workspaceId/invite")
    .post(inviteMember);

router.route("/:workspaceId/members/:userId")
    .put(updateMemberRole)
    .delete(removeMember);

export default router;
