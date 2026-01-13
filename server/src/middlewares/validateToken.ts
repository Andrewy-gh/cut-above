import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../services/authService.js';

const tokenValidationMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  await validateToken(req.params as { id: string; token: string });
  next();
};

export default tokenValidationMiddleware;
