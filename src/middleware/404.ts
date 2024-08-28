import { Request, Response, NextFunction } from "express";

const NotFound = (_req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    message: 'Not Found',
    status: 404
  });
};

export default NotFound;