import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../services/authService.js';

const tokenValidationMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const result = await validateToken(req.params as { id: string; token: string });
  return result.match({
    ok: () => {
      next();
    },
    err: (error) => _res.status(error.statusCode).json({ error: error.message }),
  });
};

export default tokenValidationMiddleware;
