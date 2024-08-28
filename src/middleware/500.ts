import { Request, Response, NextFunction } from "express";

const HandleError = (err: TypeError, _req: Request, res: Response, _next: NextFunction): void => {
  res.status(500).json({
    message: err.message,
    status: 500
  });
};

export default HandleError;