import { Request, Response } from 'express';
import { Result } from 'better-result';
import { User } from '../models/index.js';
import { DatabaseError } from '../errors.js';

/**
 * @description retrieves all Users
 * @route /api/users/
 * @method GET
 */
export const getAllUsers = async (_: Request, res: Response) => {
  const result = await Result.tryPromise({
    try: () => User.findAll(),
    catch: (cause) =>
      new DatabaseError({
        statusCode: 500,
        message:
          cause instanceof Error
            ? cause.message
            : 'Failed to fetch users',
      }),
  });

  return result.match({
    ok: (users) => res.json(users),
    err: (error) => res.status(error.statusCode).json({ error: error.message }),
  });
};
