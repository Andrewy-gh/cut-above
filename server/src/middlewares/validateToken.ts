import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../services/authService.js';

const tokenValidationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await validateToken(req.params);
  next();
};

export default tokenValidationMiddleware;
