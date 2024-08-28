import { PrismaClient } from "@prisma/client";
import { body } from "express-validator";

const prisma = new PrismaClient();

export const UpdateProjectCategoryRequest = [
  body("name").not().isEmpty().withMessage("Name is required"),
  body("name").custom(async (value, { req }) => {
    const projectCategoryUuid = req.params?.uuid;

    const projectCategory = await prisma.projectCategory.findFirst({
      where: {
        name: value,
        NOT: {
          uuid: projectCategoryUuid
        }
      }
    });

    if (projectCategory) {
      return Promise.reject("Name already exists");
    }
  }),
  body("name").isString().withMessage("Name must be a string"),
  body("name").isLength({ min: 2, max: 255 }).withMessage("Name must be at least 2 characters long")
]