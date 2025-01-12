import { Router } from "express";
import CertificateController from "../controllers/CertificateController";
import { StoreCertificateRequest } from "../requests/certificate/StoreCertificateRequest";
import { UpdateCertificateRequest } from "../requests/certificate/UpdateCertificateRequest";
import { accessValidation } from "../middleware/authorization";

const router = Router();
const controller = new CertificateController();

router.get("/certificates", accessValidation, controller.all);
router.get("/certificates/:uuid", accessValidation, controller.show);
router.post("/certificates", StoreCertificateRequest, accessValidation, controller.store);
router.patch("/certificates/:uuid", UpdateCertificateRequest, accessValidation, controller.update);
router.delete("/certificates/:uuid", accessValidation, controller.delete);

router.get("/certificates-front", controller.allFront);

export default router;