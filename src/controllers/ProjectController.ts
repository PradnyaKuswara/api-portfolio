import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface bodyType {
  uuid: string,
  project_category_id: number,
  title: string;
  image: string;
  slug: string;
  description: string;
  stack: string;
  link_github: string | null;
  link_project: string | null;
  link_documentation: string | null;
  meta_desc: string;
  meta_keyword: string;
}

type ProjectCategory = {
  id: bigint;
  uuid: string;
  name: string;
  createdAt: Date,
  updatedAt: Date,
}

type Project = {
  id: bigint;
  uuid: string;
  project_category_id: bigint;
  title: string;
  image: string;
  slug: string;
  description: string;
  stack: string,
  link_github: string | null,
  link_project: string | null,
  link_documentation: string | null,
  is_active: boolean,
  meta_desc: string,
  meta_keyword: string | null,
  createdAt: Date,
  updatedAt: Date,

  ProjectCategory: ProjectCategory
}

const generateUUID = (): string => {
  return uuidv4();
};

const generateSlug = (title: string): string => {
  return title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();
}

class ProjectController {
  async all(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const { page, limit, search = '' }: {
        page?: string;
        limit?: string;
        search?: string
      } = req.query;

      const pageNumber: number | undefined = page ? parseInt(page as string, 10) : undefined;
      const limitNumber: number | undefined = limit ? parseInt(limit as string, 10) : undefined;

      const [projects, totalProjects]: [Project[], number] = await prisma.$transaction([
        prisma.project.findMany({
          where: {
            title: {
              contains: search as string, // Filter berdasarkan nama
            },
          },
          skip: pageNumber && limitNumber ? (pageNumber - 1) * limitNumber : undefined,
          take: limitNumber,
          include: {
            ProjectCategory: true
          }
        }),
        prisma.project.count({
          where: {
            title: {
              contains: search as string,
            },
          },
        }),
      ]);

      if (projects.length === 0) {
        res.status(200).json({
          message: "Projects not found",
          status: 200,
          data: []
        });
        return;
      }

      const responseProjects: any = projects.map((project: Project) => {
        return {
          ...project,
          id: project.id.toString(),
          project_category_id: project.project_category_id.toString(),
          ProjectCategory: {
            ...project.ProjectCategory,
            id: project.ProjectCategory.id.toString()
          }
        }
      });

      res.status(200).json({
        message: "Projects retrieved",
        status: 200,
        data: responseProjects,
        total: totalProjects
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    const slugParam: string = req.params.slug;

    try {
      const project: Project | null = await prisma.project.findFirst({
        where: {
          slug: slugParam
        },
        include: {
          ProjectCategory: true
        }
      });

      if (!project) {
        res.status(404).json({
          message: "Project not found",
          status: 404,
          data: null
        });
        return;
      }

      res.status(200).json({
        message: "Project retrieved",
        status: 200,
        data: {
          ...project,
          id: project.id.toString(),
          project_category_id: project.project_category_id.toString(),
          ProjectCategory: {
            ...project.ProjectCategory,
            id: project.ProjectCategory.id.toString()
          }
        }
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    let errors: any = validationResult(req);
    let imageSaved: string = "";
    let additionalErrors: any[] = [];

    if (!req.file) {
      additionalErrors.push({
        type: "field",
        msg: "Image is required",
        path: "image",
        location: "body",
        value: undefined
      });
    } else {
      imageSaved = path.relative("public", req.file.path);
    }

    if (!errors.isEmpty() || additionalErrors.length > 0) {
      const allErrors: any[] = [...errors.array(), ...additionalErrors];
      res.status(400).json({
        message: "Validation error",
        status: 400,
        errors: allErrors
      });
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return;
    }

    const body: bodyType = req.body;

    try {
      const project: Project = await prisma.project.create({
        data: {
          uuid: generateUUID(),
          project_category_id: body.project_category_id,
          title: body.title,
          image: imageSaved,
          slug: generateSlug(body.title),
          description: body.description,
          stack: body.stack,
          link_github: body.link_github,
          link_project: body.link_project,
          link_documentation: body.link_documentation,
          meta_desc: body.meta_desc,
          meta_keyword: body.meta_keyword,
        },
        include: {
          ProjectCategory: true
        }
      });

      res.status(201).json({
        message: "Project created successfully",
        status: 201,
        data: {
          ...project,
          id: project.id.toString(),
          project_category_id: project.project_category_id.toString(),
          ProjectCategory: {
            ...project.ProjectCategory,
            id: project.ProjectCategory.id.toString()
          }
        }
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors: any = validationResult(req);
    let imageUpdated: string = "";

    if (!errors.isEmpty()) {
      res.status(400).json({
        message: "Validation error",
        status: 400,
        errors: errors.array()
      });
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return;
    }

    const project: Project | null = await prisma.project.findFirst({
      where: {
        slug: req.params.slug
      },
      include: {
        ProjectCategory: true
      }
    });

    if (!project) {
      res.status(404).json({
        message: "Project not found",
        status: 404,
        data: null
      });
      return;
    }

    if (req.file && project) {
      fs.unlinkSync(`public/${project.image}`);
      imageUpdated = path.relative("public", req.file.path);
    } else {
      imageUpdated = project?.image || "";
    }

    const slugParam: string = req.params.slug;
    const body: bodyType = req.body;

    try {
      const projectUpdate: Project = await prisma.project.update({
        where: {
          slug: slugParam
        },
        data: {
          project_category_id: body.project_category_id,
          title: body.title,
          image: imageUpdated,
          slug: project && project.title !== body.title ? generateSlug(body.title) : project?.slug,
          description: body.description,
          stack: body.stack,
          link_github: body.link_github,
          link_project: body.link_project,
          link_documentation: body.link_documentation,
          meta_desc: body.meta_desc,
          meta_keyword: body.meta_keyword,
        },
        include: {
          ProjectCategory: true
        }
      });

      res.status(200).json({
        message: "Project updated successfully",
        status: 200,
        data: {
          ...projectUpdate,
          id: projectUpdate.id.toString(),
          project_category_id: projectUpdate.project_category_id.toString(),
          ProjectCategory: {
            ...projectUpdate.ProjectCategory,
            id: projectUpdate.ProjectCategory.id.toString()
          }
        }
      });

    } catch (error: unknown) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const slugParam: string = req.params.slug;

    try {
      const project: Project | null = await prisma.project.findFirst({
        where: {
          slug: slugParam
        },
        include: {
          ProjectCategory: true
        }
      });

      if (!project) {
        res.status(404).json({
          message: "Project not found",
          status: 404,
          data: null
        });
        return;
      }

      fs.unlinkSync(`public/${project.image}`);

      await prisma.project.delete({
        where: {
          slug: slugParam
        }
      });

      res.status(200).json({
        message: "Project deleted successfully",
        status: 200
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    const slugParam: string = req.params.slug;

    try {
      const project: Project | null = await prisma.project.findFirst({
        where: {
          slug: slugParam
        },
        include: {
          ProjectCategory: true
        }
      });

      if (!project) {
        res.status(404).json({
          message: "Project not found",
          status: 404,
          data: null
        });
        return;
      }

      await prisma.project.update({
        where: {
          slug: slugParam
        },
        data: {
          is_active: !project.is_active
        },
        include: {
          ProjectCategory: true
        }
      });

      res.status(200).json({
        message: "Project update status successfully",
        status: 200
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async allFront(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const { page, limit, search = '' }: {
        page?: string;
        limit?: string;
        search?: string
      } = req.query;

      const pageNumber: number | undefined = page ? parseInt(page as string, 10) : undefined;
      const limitNumber: number | undefined = limit ? parseInt(limit as string, 10) : undefined;

      const [projects, totalProjects]: [Project[], number] = await prisma.$transaction([
        prisma.project.findMany({
          where: {
            title: {
              contains: search as string, // Filter berdasarkan nama
            },
            is_active: true
          },
          skip: pageNumber && limitNumber ? (pageNumber - 1) * limitNumber : undefined,
          take: limitNumber,
          include: {
            ProjectCategory: true
          }
        }),
        prisma.project.count({
          where: {
            title: {
              contains: search as string,
            },
            is_active: true
          },
        }),
      ]);

      if (projects.length === 0) {
        res.status(200).json({
          message: "Projects not found",
          status: 200,
          data: []
        });
        return;
      }

      const responseProjects: any = projects.map((project: Project) => {
        return {
          ...project,
          id: project.id.toString(),
          project_category_id: project.project_category_id.toString(),
          ProjectCategory: {
            ...project.ProjectCategory,
            id: project.ProjectCategory.id.toString()
          }
        }
      });

      res.status(200).json({
        message: "Projects retrieved",
        status: 200,
        data: responseProjects,
        total: totalProjects
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async showFront(req: Request, res: Response, next: NextFunction): Promise<void> {
    const slugParam: string = req.params.slug;

    try {
      const project: Project | null = await prisma.project.findFirst({
        where: {
          slug: slugParam,
          is_active: true
        },
        include: {
          ProjectCategory: true
        }
      });

      if (!project) {
        res.status(200).json({
          message: "Project not found",
          status: 200,
          data: null
        });
        return;
      }

      res.status(200).json({
        message: "Project retrieved",
        status: 200,
        data: {
          ...project,
          id: project.id.toString(),
          project_category_id: project.project_category_id.toString(),
          ProjectCategory: {
            ...project.ProjectCategory,
            id: project.ProjectCategory.id.toString()
          }
        }
      });
    } catch (error: unknown) {
      next(error);
    }
  }
}

export default ProjectController;