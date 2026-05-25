import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import {
    createNote,
    getProjectNotes,
    getNoteById,
    updateNote,
    deleteNote
} from "../controllers/note.controller.js";

const router = Router();

// Apply VerifyJWT middleware to all routes
router.use(VerifyJWT);

// Note routes
router.route("/:projectId")
    .get(getProjectNotes)
    .post(createNote);

router.route("/:projectId/n/:noteId")
    .get(getNoteById)
    .put(updateNote)
    .delete(deleteNote);

export default router;
