import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface bodyType {
  email: string;
  password: string;
}

interface userData {
  uuid: string;
  email: string;
  name: string;
}

interface ValidationRequest extends Request {
  userData: userData;
}

class AuthenticatedSessionController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email, password }: bodyType = req.body;
    const errors: any = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        message: "Validation failed",
        status: 400,
        errors: errors.array()
      });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email
        }
      });

      if (!user) {
        res.status(404).json({
          message: "User not found",
          status: 404,
          data: null
        });
        return;
      }

      if (!user.password) {
        res.status(401).json({
          message: "Invalid credentials",
          status: 401,
          data: null
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({
          message: "Invalid credentials",
          status: 401,
          data: null
        });
        return;
      }

      const token = jwt.sign({
        uuid: user.uuid,
        email: user.email,
        name: user.name,
      }, process.env.JWT_SECRET as string, {
        expiresIn: 60 * 60 * 1
      });

      res.status(200).json({
        message: "User logged in",
        status: 200,
        data: {
          ...user,
          id: user.id.toString()
        },
        token: token,
      });
    } catch (error) {
      next(error);
    }
  }

  async tokenValidation(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const validationReq = req as ValidationRequest;

    res.status(200).json({
      message: "Token is valid",
      status: 200,
      data: validationReq.userData
    });
  }

  async logout(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    //logout logic jwtWebToken

    res.status(200).json({
      message: "User logged out",
      status: 200,
      data: null
    });
  }
}

export default AuthenticatedSessionController;