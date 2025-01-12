import { PrismaClient } from "@prisma/client";
import { body } from "express-validator";

const prisma = new PrismaClient();

export const UpdateProjectRequest = [
  body("project_category_id").not().isEmpty().withMessage("Project category id is required"),
  body("project_category_id").isNumeric().withMessage("Project category id must be a number"),
  body("title").not().isEmpty().withMessage("Title is required"),
  body("title").isString().withMessage("Title must be a string"),
  body("title").isLength({ min: 2 }).withMessage("Title must be at least 2 characters long"),
  body("description").not().isEmpty().withMessage("Description is required"),
  body("description").isString().withMessage("Description must be a string"),
  body("description").isLength({ min: 2 }).withMessage("Description must be at least 2 characters long"),
  body("stack").not().isEmpty().withMessage("Stack is required"),
  body("stack").isString().withMessage("Stack must be a string"),
  body("stack").isLength({ min: 2 }).withMessage("Stack must be at least 2 characters long"),
  body("meta_desc").not().isEmpty().withMessage("Meta description is required"),
  body("meta_desc").isString().withMessage("Meta description must be a string"),
  body("meta_desc").isLength({ min: 2 }).withMessage("Meta description must  be at least 2 characters long"),
  body("meta_keyword").isString().withMessage("Meta keyword must be a string"),
  body("meta_keyword").isLength({ min: 2 }).withMessage("Meta keyword must  be at least 2 characters long"),
  body("title").custom(async (value, { req }) => {
    const projectSlug = req.params?.slug;

    const project = await prisma.project.findFirst({
      where: {
        title: value,
        NOT: {
          slug: projectSlug
        }
      }
    });

    if (project) {
      return Promise.reject("Title already exists");
    }
  }),
]