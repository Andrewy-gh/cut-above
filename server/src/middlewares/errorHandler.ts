import { Request, Response, NextFunction } from 'express';
import { ValidationError as SequelizeValidationError } from 'sequelize';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger/index.js';
import { sendProblem } from '../utils/problemDetails.js';

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
    return sendProblem(res, _req, err);
  }

  if (err instanceof SequelizeValidationError) {
    const errorMessage = err.errors.map((error) => error.message).join(', ');
    return sendProblem(res, _req, err, { status: 400, detail: errorMessage });
  }

  if (err instanceof Error) {
    return sendProblem(res, _req, err);
  }

  return sendProblem(res, _req, new Error('Unknown error occurred'), {
    status: 500,
  });
};

export default errorHandler;
