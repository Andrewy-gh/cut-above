import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger/index.js';

const errorHandler = async (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<Response | void> => {
  logger.error('====================================');
  logger.error(err);
  logger.error('====================================');

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Handles sequelize validation errors
  if (err.errors) {
    const errorMessage = err?.errors.map((error: any) => error.message).join(', ');
    return res.status(400).json({ error: errorMessage });
  }

  return res.status(500).json({ error: err.message });
};

export default errorHandler;
