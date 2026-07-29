import { Router } from "express";
import {
    createComment,
    getTaskComments,
    updateComment,
    deleteComment,
    addReaction
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT);

router.route("/")
    .post(createComment)
    .get(getTaskComments);

router.route("/:commentId")
    .put(updateComment)
    .delete(deleteComment);

router.post("/:commentId/reactions", addReaction);

export default router;
