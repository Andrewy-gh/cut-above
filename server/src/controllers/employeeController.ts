import { Request, Response } from 'express';
import { Result } from 'better-result';
import { User } from '../models/index.js';
import { DatabaseError } from '../errors.js';
import { sendProblem } from '../utils/problemDetails.js';

export const getAllEmployees = async (_req: Request, res: Response) => {
  const result = await Result.tryPromise({
    try: () =>
      User.findAll({
        where: { role: 'employee' },
        attributes: {
          exclude: ['lastName', 'email', 'role', 'image', 'profile'],
        },
      }),
    catch: (cause) =>
      new DatabaseError({
        statusCode: 500,
        message:
          cause instanceof Error
            ? cause.message
            : 'Failed to fetch employees',
        cause,
      }),
  });

  return result.match({
    ok: (employees) => res.json(employees),
    err: (error) => sendProblem(res, _req, error),
  });
};

export const getEmployeeProfiles = async (_req: Request, res: Response) => {
  const result = await Result.tryPromise({
    try: () =>
      User.findAll({
        where: { role: 'employee' },
        attributes: {
          exclude: ['lastName', 'email', 'role'],
        },
      }),
    catch: (cause) =>
      new DatabaseError({
        statusCode: 500,
        message:
          cause instanceof Error
            ? cause.message
            : 'Failed to fetch employees',
        cause,
      }),
  });

  return result.match({
    ok: (employees) => res.json(employees),
    err: (error) => sendProblem(res, _req, error),
  });
};
