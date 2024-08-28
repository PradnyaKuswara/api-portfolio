import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface bodyType {
  uuid: string;
  name: string;
}

type ProjectCategory = {
  id: bigint;
  uuid: string;
  name: string;
  createdAt: Date,
  updatedAt: Date,
}

const generateUUID = (): string => {
  return uuidv4();
};

class ProjectCategoryController {
  async all(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search = '' }: {
        page?: string;
        limit?: string;
        search?: string
      } = req.query;

      const pageNumber: number | undefined = page ? parseInt(page as string, 10) : undefined;
      const limitNumber: number | undefined = limit ? parseInt(limit as string, 10) : undefined;

      const [projectCategories, totalProjectCategories]: [ProjectCategory[], number] = await prisma.$transaction([
        prisma.projectCategory.findMany({
          where: {
            name: {
              contains: search as string,
            },
          },
          skip: pageNumber && limitNumber ? (pageNumber - 1) * limitNumber : undefined,
          take: limitNumber,
        }),
        prisma.projectCategory.count({
          where: {
            name: {
              contains: search as string,
            },
          },
        }),
      ]);

      if (projectCategories.length === 0) {
        res.status(200).json({
          message: "Project Categories not found",
          status: 200,
          data: [],
        });
        return;
      }

      const responseProjectCategories: any = projectCategories.map((projectCategory: ProjectCategory) => {
        return {
          ...projectCategory,
          id: projectCategory.id.toString(),
        };
      });

      res.status(200).json({
        message: "Project Categories retrieved",
        status: 200,
        data: responseProjectCategories,
        total: totalProjectCategories,
      });
    } catch (error: unknown) {
      next(error);
    }
  }


  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    const uuidParam: string = req.params.uuid;

    try {
      const projectCategory: ProjectCategory | null = await prisma.projectCategory.findFirst({
        where: {
          uuid: uuidParam
        }
      });

      if (!projectCategory) {
        res.status(404).json({
          message: "Project Category not found",
          status: 404,
          data: null
        });
        return;
      }

      const responseProjectCategory: any = {
        ...projectCategory,
        id: projectCategory.id.toString()
      }

      res.status(200).json({
        message: "Project Category retrieved",
        status: 200,
        data: responseProjectCategory
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors: any = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        message: "Validation error",
        status: 400,
        errors: errors.array()
      });
      return;
    }

    const body: bodyType = req.body;

    try {
      const projectCategory: ProjectCategory = await prisma.projectCategory.create({
        data: {
          uuid: generateUUID(),
          name: body.name
        }
      });

      const responseProjectCategory: any = {
        ...projectCategory,
        id: projectCategory.id.toString()
      }

      res.status(201).json({
        message: "Project Category created successfully",
        status: 201,
        data: responseProjectCategory
      });

    } catch (error: unknown) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors: any = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        message: "Validation error",
        status: 400,
        errors: errors.array()
      });
      return;
    }

    const uuid: string = req.params.uuid;

    const projectCategoryExist: ProjectCategory | null = await prisma.projectCategory.findFirst({
      where: {
        uuid: uuid
      }
    });

    if (!projectCategoryExist) {
      res.status(404).json({
        message: "Project Category not found",
        status: 404,
        data: null
      });
      return;
    }

    const body: bodyType = req.body;

    try {
      const projectCategory: ProjectCategory = await prisma.projectCategory.update({
        where: {
          uuid: uuid
        },
        data: {
          name: body.name
        }
      });

      const responseProjectCategory = {
        ...projectCategory,
        id: projectCategory.id.toString()
      }

      res.status(200).json({
        message: "Project Category updated successfully",
        status: 200,
        data: responseProjectCategory
      });

    } catch (error: unknown) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const uuidParam: string = req.params.uuid;

    try {
      const projectCategory: ProjectCategory | null = await prisma.projectCategory.findFirst({
        where: {
          uuid: uuidParam
        }
      });

      if (!projectCategory) {
        res.status(404).json({
          message: "Project Category not found",
          status: 404,
          data: null
        });
        return;
      }

      await prisma.projectCategory.delete({
        where: {
          uuid: uuidParam
        }
      });

      res.status(200).json({
        message: "Project Category deleted successfully",
        status: 200
      });

    } catch (error: unknown) {
      next(error);
    }
  }
}

export default ProjectCategoryController;