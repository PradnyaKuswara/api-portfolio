import { Router } from "express";
import ProjectController from "../controllers/ProjectController";
import { StoreProjectRequest } from "../requests/project/StoreProjectRequest";
import { upload, compressImage } from "../middleware/fileupload";
import { UpdateProjectRequest } from "../requests/project/UpdateProjectRequest";
import { accessValidation } from "../middleware/auth";

const router = Router();

const controller = new ProjectController();

router.get("/projects", accessValidation, controller.all);
router.get("/projects/:slug", accessValidation, controller.show);
router.post("/projects", upload, compressImage, StoreProjectRequest, accessValidation, controller.store);
router.patch("/projects/:slug", upload, compressImage, UpdateProjectRequest, accessValidation, controller.update);
router.delete("/projects/:slug", accessValidation, controller.delete);
router.patch("/projects/status/:slug", accessValidation, controller.updateStatus);

router.get("/projects-front", controller.allFront);
router.get("/projects-front/:slug", controller.showFront);

export default router;