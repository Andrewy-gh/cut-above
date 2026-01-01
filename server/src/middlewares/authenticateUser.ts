import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError.js';

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.session) {
    throw new ApiError(403, 'Forbidden: not authenticated');
  }
  if (!req.session.userId) {
    throw new ApiError(401, 'Session expired, please log in');
  }
  next();
};

export const authenticateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.session.isAdmin) {
    throw new ApiError(403, 'Forbidden: not authorized to access this page');
  }
  next();
};
