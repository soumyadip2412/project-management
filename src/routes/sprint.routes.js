import { Router } from "express";
import {
    createSprint,
    getProjectSprints,
    getSprintById,
    updateSprint,
    startSprint,
    completeSprint,
    deleteSprint,
    getBurndownData,
    getVelocityData
} from "../controllers/sprint.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT);

router.route("/")
    .post(createSprint)
    .get(getProjectSprints);

router.get("/velocity", getVelocityData);

router.route("/:sprintId")
    .get(getSprintById)
    .put(updateSprint)
    .delete(deleteSprint);

router.post("/:sprintId/start", startSprint);
router.post("/:sprintId/complete", completeSprint);
router.get("/:sprintId/burndown", getBurndownData);

export default router;
