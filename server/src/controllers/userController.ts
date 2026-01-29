import { Request, Response } from 'express';
import { User } from '../models/index.js';
import { tryDb } from '../utils/dbResult.js';
import { errorResponse } from '../utils/errorDetails.js';

/**
 * @description retrieves all Users
 * @route /api/users/
 * @method GET
 */
export const getAllUsers = async (req: Request, res: Response) => {
  const result = await tryDb({
    try: () => User.findAll(),
    message: 'Failed to fetch users',
  });

  return result.match({
    ok: (users) => res.json(users),
    err: (error) => errorResponse(res, req, error),
  });
};
