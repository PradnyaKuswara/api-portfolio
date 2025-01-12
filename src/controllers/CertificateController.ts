import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from 'uuid';
import { bodyType, Certificate } from "../@types/Certificate";

const prisma = new PrismaClient();

const generateUUID = (): string => {
  return uuidv4();
};

class CertificateController {
  async all(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search = '' }: {
        page?: string;
        limit?: string;
        search?: string
      } = req.query;

      const pageNumber: number | undefined = page ? parseInt(page as string, 10) : undefined;
      const limitNumber: number | undefined = limit ? parseInt(limit as string, 10) : undefined;

      const [certificates, totalCertificates]: [Certificate[], number] = await prisma.$transaction([
        prisma.certificate.findMany({
          where: {
            name: {
              contains: search as string, // Filter berdasarkan nama
            },
          },
          skip: pageNumber && limitNumber ? (pageNumber - 1) * limitNumber : undefined,
          take: limitNumber,
        }),
        prisma.certificate.count({
          where: {
            name: {
              contains: search as string,
            },
          },
        }),
      ]);

      if (certificates.length === 0) {
        res.status(200).json({
          message: "Certificates not found",
          status: 200,
          data: []
        });
        return;
      }

      const responsecertificates: any = certificates.map((certificate: Certificate) => {
        return {
          ...certificate,
          id: certificate.id.toString()
        }
      });

      res.status(200).json({
        message: "Certificates retrieved",
        status: 200,
        data: responsecertificates,
        total: totalCertificates
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    const uuidParam: string = req.params.uuid;

    try {
      const certificate: Certificate | null = await prisma.certificate.findFirst({
        where: {
          uuid: uuidParam
        }
      });

      if (!certificate) {
        res.status(404).json({
          message: "certificate not found",
          status: 404,
          data: null
        });
        return;
      }

      const responsecertificate: any = {
        ...certificate,
        id: certificate.id.toString()
      };

      res.status(200).json({
        message: "certificate retrieved",
        status: 200,
        data: responsecertificate
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors: any = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        message: "The given data was invalid",
        status: 400,
        errors: errors.array()
      });
      return;
    }

    const body: bodyType = req.body;

    try {
      const certificate: Certificate = await prisma.certificate.create({
        data: {
          uuid: generateUUID(),
          name: body.name,
          organization: body.organization,
          month_obtained: body.month_obtained,
          year_obtained: body.year_obtained,
          month_expired: body.month_expired,
          year_expired: body.year_expired,
          url: body.url,
          description: body.description
        }
      });

      const responsecertificate = {
        ...certificate,
        id: certificate.id.toString()
      };

      res.status(201).json({
        message: "certificate created successfully",
        status: 201,
        data: responsecertificate
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors: any = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        message: "The given data was invalid",
        errors: errors.array()
      });
      return;
    }

    const uuidParam: string = req.params.uuid;

    const certificateExist: Certificate | null = await prisma.certificate.findFirst({
      where: {
        uuid: uuidParam
      }
    });

    if (!certificateExist) {
      res.status(404).json({
        message: "Certificate not found",
        status: 404,
        data: null
      });
      return;
    }

    const body: bodyType = req.body;

    try {
      const certificate: Certificate = await prisma.certificate.update({
        where: {
          uuid: uuidParam
        },
        data: {
          name: body.name,
          organization: body.organization,
          month_obtained: body.month_obtained,
          year_obtained: body.year_obtained,
          month_expired: body.month_expired,
          year_expired: body.year_expired,
          url: body.url,
          description: body.description
        }
      });

      const responsecertificate = {
        ...certificate,
        id: certificate.id.toString()
      };

      res.status(200).json({
        message: "Certificate updated successfully",
        status: 200,
        data: responsecertificate
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const uuidParam: string = req.params.uuid;

    try {
      const certificate: Certificate | null = await prisma.certificate.findFirst({
        where: {
          uuid: uuidParam
        }
      });

      if (!certificate) {
        res.status(404).json({
          message: "Certificate not found",
          status: 404,
          data: null
        });
        return;
      }

      await prisma.certificate.delete({
        where: {
          uuid: uuidParam
        }
      });

      res.status(200).json({
        message: "Certificate deleted successfully",
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

      const [certificates, totalCertificates]: [Certificate[], number] = await prisma.$transaction([
        prisma.certificate.findMany({
          where: {
            name: {
              contains: search as string, // Filter berdasarkan nama
            },
          },
          skip: pageNumber && limitNumber ? (pageNumber - 1) * limitNumber : undefined,
          take: limitNumber,
        }),
        prisma.certificate.count({
          where: {
            name: {
              contains: search as string,
            },
          },
        }),
      ]);

      if (certificates.length === 0) {
        res.status(200).json({
          message: "Certificates not found",
          status: 200,
          data: []
        });
        return;
      }

      const responsecertificates: any = certificates.map((certificate: Certificate) => {
        return {
          ...certificate,
          id: certificate.id.toString()
        }
      });

      res.status(200).json({
        message: "Certificates retrieved",
        status: 200,
        data: responsecertificates,
        total: totalCertificates
      });
    } catch (error: unknown) {
      next(error);
    }
  }
}

export default CertificateController;