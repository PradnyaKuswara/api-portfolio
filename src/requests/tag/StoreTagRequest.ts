import { PrismaClient } from "@prisma/client";
import { body } from "express-validator";

const prisma = new PrismaClient();

export const StoreTagRequest = [
  body("name").not().isEmpty().withMessage("Name is required"),
  body("name").custom(async (value) => {
    const tag = await prisma.tag.findFirst({
      where: {
        name: value
      }
    });

    if (tag) {
      return Promise.reject("Name already exists");
    }
  }),
  body("name").isString().withMessage("Name must be a string"),
  body("name").isLength({ min: 2, max:255 }).withMessage("Name must be at least 2 characters long")
]