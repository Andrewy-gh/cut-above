import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../services/authService.js';
import { errorResponse } from '../utils/errorDetails.js';

const tokenValidationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await validateToken(req.params as { id: string; token: string });
  return result.match({
    ok: () => {
      next();
    },
    err: (error) => errorResponse(res, req, error),
  });
};

export default tokenValidationMiddleware;
