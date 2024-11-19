import { Router } from "express";
import TagController from "../controllers/TagController";
import { StoreTagRequest } from "../requests/tag/StoreTagRequest";
import { UpdateTagRequest } from "../requests/tag/UpdateTagRequest";
import { accessValidation } from "../middleware/authorization";

const router = Router();
const controller = new TagController();

router.get("/tags", accessValidation, controller.all);
router.get("/tags/:uuid", accessValidation, controller.show);
router.post("/tags", StoreTagRequest, accessValidation, controller.store);
router.patch("/tags/:uuid", UpdateTagRequest, accessValidation, controller.update);
router.delete("/tags/:uuid", accessValidation, controller.delete);

export default router;