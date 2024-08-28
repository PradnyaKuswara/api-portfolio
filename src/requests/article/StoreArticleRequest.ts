import { PrismaClient } from "@prisma/client";
import { body } from "express-validator";

const prisma = new PrismaClient();

export const StoreArticleRequest = [
  body("title").not().isEmpty().withMessage("Title is required"),
  body("title").isString().withMessage("Title must be a string"),
  body("title").isLength({ min: 2 }).withMessage("Title must be at least 2 characters long"),
  body("content").not().isEmpty().withMessage("Content is required"),
  body("content").isString().withMessage("Content must be a string"),
  body("content").isLength({ min: 2 }).withMessage("Content must be at least 2 characters long"),
  body("tags").not().isEmpty().withMessage("Tag is required"),
  body("tags").isString().withMessage("Tag must be a string"),
  body("meta_desc").not().isEmpty().withMessage("Meta description is required"),
  body("meta_desc").isString().withMessage("Meta description must be a string"),
  body("meta_desc").isLength({ min: 2 }).withMessage("Meta description must  be at least 2 characters long"),
  body("meta_keyword").isString().withMessage("Meta keyword must be a string"),
  body("meta_keyword").isLength({ min: 2 }).withMessage("Meta keyword must  be at least 2 characters long"),
  body("title").custom(async (value) => {
    const article = await prisma.article.findFirst({
      where: {
        title: value
      }
    });

    if (article) {
      return Promise.reject("Title already exists");
    }
  }),
]