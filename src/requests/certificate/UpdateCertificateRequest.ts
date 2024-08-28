import { PrismaClient } from "@prisma/client";
import { body } from "express-validator";

const prisma = new PrismaClient();

export const UpdateCertificateRequest = [
  body("name").not().isEmpty().withMessage("Name is required"),
  body("organization").not().isEmpty().withMessage("Organization is required"),
  body("month_obtained").not().isEmpty().withMessage("Month obtained is required"),
  body("year_obtained").not().isEmpty().withMessage("Year obtained is required"),
  body("month_expired").not().isEmpty().withMessage("Month expired is required"),
  body("year_expired").not().isEmpty().withMessage("Year expired is required"),
  body("url").not().isEmpty().withMessage("URL is required"),
  body("url").isURL().withMessage("URL must be a valid URL"),
  body("description").not().isEmpty().withMessage("Description is required"),
  body("name").isString().withMessage("Name must be a string"),
  body("organization").isString().withMessage("Organization must be a string"),
  body("month_obtained").isString().withMessage("Month obtained must be a string"),
  body("year_obtained").isString().withMessage("Year obtained must be a string"),
  body("month_expired").isString().withMessage("Month expired must be a string"),
  body("year_expired").isString().withMessage("Year expired must be a string"),
  body("url").isString().withMessage("URL must be a string"),
  body("description").isString().withMessage("Description must be a string"),
  body("name").isLength({ min: 2, max: 255 }).withMessage("Name must be at least 2 characters long"),
  body("organization").isLength({ min: 2, max: 255 }).withMessage("Organization must be at least 2 characters long"),
  body("month_obtained").isLength({ min: 2, max: 255 }).withMessage("Month obtained must be at least 2 characters long"),
  body("year_obtained").isLength({ min: 2, max: 255 }).withMessage("Year obtained must be at least 2 characters long"),
  body("month_expired").isLength({ min: 2, max: 255 }).withMessage("Month expired must be at least 2 characters long"),
  body("year_expired").isLength({ min: 2, max: 255 }).withMessage("Year expired must be at least 2 characters long"),
  body("url").isLength({ min: 2, max: 255 }).withMessage("URL must be at least 2 characters long"),
  body("description").isLength({ min: 2 }).withMessage("Description must be at least 2 characters long"),
  body("name").custom(async (value, { req }) => {
    const sertificateUuid = req.params?.uuid;

    const sertificate = await prisma.certificate.findFirst({
      where: {
        name: value,
        NOT: {
          uuid: sertificateUuid
        }
      }
    });

    if (sertificate) {
      return Promise.reject("Name already exists");
    }
  })
];