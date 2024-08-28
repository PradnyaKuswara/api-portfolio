import { Router } from "express"; 
import AuthenticatedSessionController from "../controllers/AuthenticatedSessionController";
import { StoreLoginRequest } from "../requests/login/StoreLoginRequest";
import { accessValidation } from "../middleware/auth";

const router = Router();

const controller = new AuthenticatedSessionController();

router.post("/login", StoreLoginRequest, controller.login);
router.post("/validate-token", accessValidation, controller.tokenValidation);
router.post("/logout", accessValidation, controller.logout);

export default router;