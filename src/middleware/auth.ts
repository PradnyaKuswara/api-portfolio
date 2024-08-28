import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// interface CustomRequest extends Request {
//   headers: {
//     authorization: string;
//   },
//   userData?: any;
// }

interface userData {
  uuid: string;
  email: string;
  name: string;
}

interface ValidationRequest extends Request {
  userData: userData;
}

export const accessValidation = (req: Request, res: Response, next: NextFunction) => {
  const validationReq = req as ValidationRequest;
  const { authorization } = validationReq.headers;

  if (!authorization) {
    return res.status(401).json({
      message: 'Unauthorized',
      status: 401,
      data: null
    });
  }

  const token = authorization.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  try {
    const decoded  = jwt.verify(token, secret as string);

    if (!decoded) {
      return res.status(401).json({
        message: 'Unauthorized',
        status: 401,
        data: null
      });
    }

    if (typeof decoded !== 'string') {
      validationReq.userData = decoded as userData;
    }else {
      const data = JSON.parse(decoded);
      validationReq.userData = data as userData;
    }

    return next();
  } catch (error) {
    return res.status(401).json({
      message: error,
      status: 401,
      data: null
    });
  }

  next();
}