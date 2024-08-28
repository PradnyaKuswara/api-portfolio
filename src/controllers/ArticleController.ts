import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface bodyType {
  uuid: string,
  title: string;
  thumbail: string;
  slug: string;
  content: string;
  meta_desc: string;
  meta_keyword: string;
  tags: string;
}

type Tag = {
  id: bigint,
  uuid: string,
  name: string,
  createdAt: Date,
  updatedAt: Date,
}

type ArticleTag = {
  Tag: Tag
}

type Article = {
  id: bigint,
  uuid: string,
  title: string,
  thumbnail: string,
  slug: string,
  content: string,
  meta_desc: string,
  meta_keyword: string | null,
  is_active: boolean,
  createdAt: Date,
  updatedAt: Date,
  tags: ArticleTag[]
}

const generateUUID = (): string => {
  return uuidv4();
};

const generateSlug = (title: string): string => {
  return title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();
}

class ArticleController {
  async all(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search = '' }: {
        page?: string;
        limit?: string;
        search?: string
      } = req.query;

      const pageNumber: number | undefined = page ? parseInt(page as string, 10) : undefined;
      const limitNumber: number | undefined = limit ? parseInt(limit as string, 10) : undefined;

      const [articles, totalArticles]: [Article[], number] = await prisma.$transaction([
        prisma.article.findMany({
          where: {
            title: {
              contains: search as string, // Filter berdasarkan nama
            },
          },
          skip: pageNumber && limitNumber ? (pageNumber - 1) * limitNumber : undefined,
          take: limitNumber,
          include: {
            tags: {
              include: {
                Tag: true
              }
            }
          }
        }),
        prisma.article.count({
          where: {
            title: {
              contains: search as string,
            },
          },
        }),
      ]);


      if (articles.length === 0) {
        res.status(200).json({
          message: "Articles not found",
          status: 200,
          data: []
        });
        return;
      }

      const responseArticles: any = articles.map((article: Article) => {
        return {
          ...article,
          id: article.id.toString(),
          tags: article.tags.map((tag: ArticleTag) => {
            return {
              ...tag.Tag,
              id: tag.Tag.id.toString()
            }
          })
        };
      });

      res.status(200).json({
        message: "Articles retrieved successfully",
        status: 200,
        data: responseArticles,
        total: totalArticles
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    const slugParam: string = req.params.slug;

    try {
      const article: Article | null = await prisma.article.findFirst({
        where: {
          slug: slugParam,
        },
        include: {
          tags: {
            include: {
              Tag: true
            }
          }
        }
      });

      if (!article) {
        res.status(404).json({
          message: "Article not found",
          status: 404,
          data: null
        });
        return;
      }

      res.status(200).json({
        message: "Article retrieved successfully",
        status: 200,
        data: {
          ...article,
          id: article.id.toString(),
          tags: article.tags.map((tag: ArticleTag) => {
            return {
              ...tag.Tag,
              id: tag.Tag.id.toString()
            }
          })
        }
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors: any = validationResult(req);
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
        message: "Validation failed",
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
      const article: Article = await prisma.article.create({
        data: {
          uuid: generateUUID(),
          title: body.title,
          thumbnail: imageSaved,
          slug: generateSlug(body.title),
          content: body.content,
          meta_desc: body.meta_desc,
          meta_keyword: body.meta_keyword,
        },
        include: {
          tags: {
            include: {
              Tag: true
            }
          }
        }
      });

      // create data tag form body.tag and transform to array and insert to article_tag
      const tags: string[] = body.tags.split(",");

      await Promise.all(
        tags.map(async (tag: string) => {
          let tagExist: Tag | null = await prisma.tag.findFirst({
            where: {
              name: tag,
            },
          });

          if (!tagExist) {
            tagExist = await prisma.tag.create({
              data: {
                uuid: generateUUID(),
                name: tag,
              },
            });
          }
          await prisma.articleTag.create({
            data: {
              article_id: article.id,
              tag_id: tagExist.id,
            },
          });
        })
      );

      const responseArticle: any = await prisma.article.findFirst({
        where: {
          id: article.id
        },
        include: {
          tags: {
            include: {
              Tag: true
            }
          }
        }
      });

      res.status(201).json({
        message: "Article created successfully",
        status: 201,
        data: {
          ...responseArticle,
          id: responseArticle?.id.toString(),
          tags: responseArticle?.tags.map((tag: ArticleTag) => {
            return {
              ...tag.Tag,
              id: tag.Tag.id.toString()
            }
          })
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
        message: "Validation failed",
        status: 400,
        errors: errors.array()
      });
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return;
    }

    const article: Article | null = await prisma.article.findFirst({
      where: {
        slug: req.params.slug,
      },
      include: {
        tags: {
          include: {
            Tag: true
          }
        }
      }
    });

    if (!article) {
      res.status(404).json({
        message: "Article not found",
        status: 404,
        data: null
      });
      return;
    }

    if (req.file && article) {
      fs.unlinkSync(`public/${article.thumbnail}`);
      imageUpdated = path.relative("public", req.file.path);
    } else {
      imageUpdated = article.thumbnail;
    }

    const slugParam: string = req.params.slug;
    const body: bodyType = req.body;

    try {
      const updatedArticle: Article = await prisma.article.update({
        where: {
          slug: slugParam,
        },
        data: {
          title: body.title,
          thumbnail: imageUpdated,
          content: body.content,
          slug: article && article.title !== body.title ? generateSlug(body.title) : article.slug,
          meta_desc: body.meta_desc,
          meta_keyword: body.meta_keyword,
        },
        include: {
          tags: {
            include: {
              Tag: true
            }
          }
        }
      });

      await prisma.articleTag.deleteMany({
        where: {
          article_id: updatedArticle.id,
        },
      });

      // create data tag form body.tag and transform to array and insert to article_tag
      const tags: string[] = body.tags.split(",");

      await Promise.all(
        tags.map(async (tag: string) => {
          let tagExist = await prisma.tag.findFirst({
            where: {
              name: tag,
            },
          });

          if (!tagExist) {
            tagExist = await prisma.tag.create({
              data: {
                uuid: generateUUID(),
                name: tag,
              },
            });
          }
          await prisma.articleTag.create({
            data: {
              article_id: updatedArticle.id,
              tag_id: tagExist.id,
            },
          });
        })
      );

      const responseArticle: Article | null = await prisma.article.findFirst({
        where: {
          id: updatedArticle.id
        },
        include: {
          tags: {
            include: {
              Tag: true
            }
          }
        }
      });

      res.status(200).json({
        message: "Article updated successfully",
        status: 200,
        data: {
          ...responseArticle,
          id: responseArticle?.id.toString(),
          tags: responseArticle?.tags.map((tag: ArticleTag) => {
            return {
              ...tag.Tag,
              id: tag.Tag.id.toString()
            }
          })
        }
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const slugParam: string = req.params.slug;

    try {
      const article: Article | null = await prisma.article.findFirst({
        where: {
          slug: slugParam
        },
        include: {
          tags: {
            include: {
              Tag: true
            }
          }
        }
      });

      if (!article) {
        res.status(404).json({
          message: "Article not found",
          status: 404,
          data: null
        });
        return;
      }

      fs.unlinkSync(`public/${article.thumbnail}`);

      await prisma.articleTag.deleteMany({
        where: {
          article_id: article.id
        }
      });

      await prisma.article.delete({
        where: {
          slug: slugParam
        }
      });

      res.status(200).json({
        message: "Article deleted successfully",
        status: 200
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    const slugParam: string = req.params.slug;

    try {
      const article: Article | null = await prisma.article.findFirst({
        where: {
          slug: slugParam
        },
        include: {
          tags: {
            include: {
              Tag: true
            }
          }
        }
      });

      if (!article) {
        res.status(404).json({
          message: "Article not found",
          status: 404,
          data: null
        });
        return;
      }

      await prisma.article.update({
        where: {
          slug: slugParam,
        },
        data: {
          is_active: !article.is_active
        },
        include: {
          tags: {
            include: {
              Tag: true
            }
          }
        }
      });
      
      res.status(200).json({
        message: "Article update status successfully",
        status: 200
      });
    } catch (error: unknown) {
      next(error);
    }
  }
}

export default ArticleController;