import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/errorDetails.js';

const errorHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof Error) {
    return errorResponse(res, req, err);
  }

  return errorResponse(res, req, new Error('Unknown error occurred'), {
    status: 500,
  });
};

export default errorHandler;
