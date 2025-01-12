import { Router } from "express";
import ProjectCategoryController from "../controllers/ProjectCategoryController";
import { StoreProjectCategoryRequest } from "../requests/project-category/StoreProjectCategoryRequest";
import { UpdateProjectCategoryRequest } from "../requests/project-category/UpdateProjectCategoryRequest";
import { accessValidation } from "../middleware/authorization";

const router = Router();
const controller = new ProjectCategoryController();

router.get("/project-categories", accessValidation, controller.all);
router.get("/project-categories/:uuid", accessValidation, controller.show);
router.post("/project-categories", StoreProjectCategoryRequest, accessValidation, controller.store);
router.patch("/project-categories/:uuid", UpdateProjectCategoryRequest, accessValidation, controller.update);
router.delete("/project-categories/:uuid", accessValidation, controller.delete);

export default router;