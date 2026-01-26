import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger/index.js';

const errorHandler = async (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('====================================');
  logger.error(err);
  logger.error('====================================');

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ValidationError) {
    const errorMessage = err.errors.map((error) => error.message).join(', ');
    return res.status(400).json({ error: errorMessage });
  }

  if (err instanceof Error) {
    return res.status(500).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Unknown error occurred' });
};

export default errorHandler;
