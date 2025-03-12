import { Router } from "express";
import ArticleController from "../controllers/ArticleController";
import { StoreArticleRequest } from "../requests/article/StoreArticleRequest";
import { UpdateArticleRequest } from "../requests/article/UpdateArticleRequest";
import { accessValidation } from "../middleware/authorization";

const router = Router();

const controller = new ArticleController();

router.get("/articles", accessValidation, controller.all);
router.get("/articles/:slug", accessValidation, controller.show);
router.post("/articles", accessValidation, StoreArticleRequest, controller.store);
router.patch("/articles/:slug", accessValidation, UpdateArticleRequest, controller.update);
router.delete("/articles/:slug", accessValidation, controller.delete);
router.patch("/articles/status/:slug", accessValidation, controller.updateStatus);

router.get("/articles-front", controller.allFront);
router.get("/articles-front/:slug", controller.showFront);

export default router;