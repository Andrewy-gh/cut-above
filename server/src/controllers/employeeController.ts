import { Request, Response } from 'express';
import { User } from '../models/index.js';

export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
  const employees = await User.findAll({
    where: { role: 'employee' },
    attributes: {
      exclude: ['lastName', 'email', 'role', 'image', 'profile'],
    },
  });
  res.json(employees);
};

export const getEmployeeProfiles = async (req: Request, res: Response): Promise<void> => {
  const employees = await User.findAll({
    where: { role: 'employee' },
    attributes: {
      exclude: ['lastName', 'email', 'role'],
    },
  });
  res.json(employees);
};
