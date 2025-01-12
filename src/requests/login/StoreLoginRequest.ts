import { body } from "express-validator";

export const StoreLoginRequest = [
  body("email").not().isEmpty().withMessage("Email is required"),
  body("email").isString().withMessage("Email must be a string"),
  body("email").isLength({ min: 2 }).withMessage("Email must be at least 2 characters long"),
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password").not().isEmpty().withMessage("Password is required"),
  body("password").isString().withMessage("Password must be a string"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
]