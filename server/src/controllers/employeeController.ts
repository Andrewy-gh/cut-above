import { Request, Response } from 'express';
import { User } from '../models/index.js';
import { tryDb } from '../utils/dbResult.js';
import { errorResponse } from '../utils/errorDetails.js';

export const getAllEmployees = async (_req: Request, res: Response) => {
  const result = await tryDb({
    try: () =>
      User.findAll({
        where: { role: 'employee' },
        attributes: {
          exclude: ['lastName', 'email', 'role', 'image', 'profile'],
        },
      }),
    message: 'Failed to fetch employees',
  });

  return result.match({
    ok: (employees) => res.json(employees),
    err: (error) => errorResponse(res, _req, error),
  });
};

export const getEmployeeProfiles = async (_req: Request, res: Response) => {
  const result = await tryDb({
    try: () =>
      User.findAll({
        where: { role: 'employee' },
        attributes: {
          exclude: ['lastName', 'email', 'role'],
        },
      }),
    message: 'Failed to fetch employees',
  });

  return result.match({
    ok: (employees) => res.json(employees),
    err: (error) => errorResponse(res, _req, error),
  });
};
