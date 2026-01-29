import { Request, Response, NextFunction } from 'express';
import { AuthorizationError, SessionError } from '../errors.js';

export const authenticateUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.session) {
    throw new AuthorizationError({
      statusCode: 403,
      message: 'Forbidden: not authenticated',
    });
  }
  if (!req.session.userId) {
    throw new SessionError({
      statusCode: 401,
      message: 'Session expired, please log in',
    });
  }
  next();
};

export const authenticateRole = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.session.isAdmin) {
    throw new AuthorizationError({
      statusCode: 403,
      message: 'Forbidden: not authorized to access this page',
    });
  }
  next();
};
