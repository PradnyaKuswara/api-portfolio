import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from 'uuid';
import { Tag, bodyType } from "../@types/Tag";

const prisma = new PrismaClient();

const generateUUID = (): string => {
  return uuidv4();
};

class TagController {
  async all(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search = '' }: {
        page?: string;
        limit?: string;
        search?: string
      } = req.query;

      const pageNumber: number | undefined = page ? parseInt(page as string, 10) : undefined;
      const limitNumber: number | undefined = limit ? parseInt(limit as string, 10) : undefined;

      const [tags, totalTags]: [Tag[], number] = await prisma.$transaction([
        prisma.tag.findMany({
          where: {
            name: {
              contains: search as string, // Filter berdasarkan nama
            },
          },
          skip: pageNumber && limitNumber ? (pageNumber - 1) * limitNumber : undefined,
          take: limitNumber,
        }),
        prisma.tag.count({
          where: {
            name: {
              contains: search as string,
            },
          },
        }),
      ]);

      if (tags.length === 0) {
        res.status(200).json({
          message: "Tags not found",
          status: 200,
          data: []
        });
        return;
      }

      const responseTags: any = tags.map((tag: Tag) => {
        return {
          ...tag,
          id: tag.id.toString()
        }
      }, []);

      res.status(200).json({
        message: "Tags retrieved",
        status: 200,
        data: responseTags,
        total: totalTags
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    const uuidParam: string = req.params.uuid;

    try {
      const tag: Tag | null = await prisma.tag.findFirst({
        where: {
          uuid: uuidParam
        }
      });

      if (!tag) {
        res.status(404).json({
          message: "Tag not found",
          status: 404,
          data: null
        });
        return;
      }

      const responseTag: any = {
        ...tag,
        id: tag.id.toString()
      }

      res.status(200).json({
        message: "Tag retrieved",
        status: 200,
        data: responseTag
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
      const tag: Tag = await prisma.tag.create({
        data: {
          uuid: generateUUID(),
          name: body.name
        }
      });

      const responseTag: any = {
        ...tag,
        id: tag.id.toString()
      }

      res.status(201).json({
        message: "Tag created successfully",
        status: 201,
        data: responseTag
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

    const uuidParam: string = req.params.uuid;

    const tagExist: Tag | null = await prisma.tag.findFirst({
      where: {
        uuid: uuidParam
      }
    });

    if (!tagExist) {
      res.status(404).json({
        message: "Tag not found",
        status: 404,
        data: null
      });
      return
    }

    const body: bodyType = req.body;

    try {
      const tag = await prisma.tag.update({
        where: {
          uuid: uuidParam
        },
        data: {
          name: body.name
        }
      });

      const responseTag: any = {
        ...tag,
        id: tag.id.toString()
      }

      res.status(200).json({
        message: "Tag updated successfully",
        status: 200,
        data: responseTag
      });

    } catch (error: unknown) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const uuidParam: string = req.params.uuid;

    try {
      const tagExist: Tag | null = await prisma.tag.findFirst({
        where: {
          uuid: uuidParam
        }
      });

      if (!tagExist) {
        res.status(404).json({
          message: "Tag not found",
          status: 404,
          data: null
        });
        return;
      }

      await prisma.tag.delete({
        where: {
          uuid: uuidParam
        }
      });

      res.status(200).json({
        message: "Tag deleted successfully",
        status: 200
      });

    } catch (error: unknown) {
      next(error);
    }
  }
}

export default TagController;