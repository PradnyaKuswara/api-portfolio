import { Router } from "express"; 
import ArticleController from "../controllers/ArticleController";
import { StoreArticleRequest } from "../requests/article/StoreArticleRequest";
import { UpdateArticleRequest } from "../requests/article/UpdateArticleRequest";
import { upload, compressImage } from "../middleware/fileupload";
import { accessValidation } from "../middleware/auth";

const router = Router();

const controller = new ArticleController();

router.get("/articles", accessValidation, controller.all);
router.get("/articles/:slug", accessValidation, controller.show);
router.post("/articles", upload, compressImage, accessValidation, StoreArticleRequest, controller.store);
router.patch("/articles/:slug", upload, compressImage, accessValidation, UpdateArticleRequest, controller.update);
router.delete("/articles/:slug", accessValidation, controller.delete);
router.patch("/articles/status/:slug",  accessValidation, controller.updateStatus);

export default router;