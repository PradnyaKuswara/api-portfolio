import { Request, Response, NextFunction } from "express";
import { bodyType, Article, ArticleTag, Tag } from "../@types/Article";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from 'uuid';


const prisma = new PrismaClient();

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

    if (!errors.isEmpty()) {
      const allErrors: any[] = [...errors.array()];
      res.status(400).json({
        message: "Validation failed",
        status: 400,
        errors: allErrors
      });
      return;
    }

    const body: bodyType = req.body;

    try {
      const article: Article = await prisma.article.create({
        data: {
          uuid: generateUUID(),
          title: body.title,
          thumbnail: body.thumbnail,
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

    if (!errors.isEmpty()) {
      res.status(400).json({
        message: "Validation failed",
        status: 400,
        errors: errors.array()
      });
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

    const slugParam: string = req.params.slug;
    const body: bodyType = req.body;

    try {
      const updatedArticle: Article = await prisma.article.update({
        where: {
          slug: slugParam,
        },
        data: {
          title: body.title,
          thumbnail: body.thumbnail,
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

  async allFront(req: Request, res: Response, next: NextFunction): Promise<void> {
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
            is_active: true
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
            is_active: true
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

  async showFront(req: Request, res: Response, next: NextFunction): Promise<void> {
    const slugParam: string = req.params.slug;

    try {
      const article: Article | null = await prisma.article.findFirst({
        where: {
          slug: slugParam,
          is_active: true
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
        res.status(200).json({
          message: "Article not found",
          status: 200,
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

}

export default ArticleController;