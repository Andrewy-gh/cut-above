import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../services/authService.js';
import { sendProblem } from '../utils/problemDetails.js';

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
    err: (error) => sendProblem(res, req, error),
  });
};

export default tokenValidationMiddleware;
