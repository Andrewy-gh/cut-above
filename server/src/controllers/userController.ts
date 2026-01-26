import { Request, Response } from 'express';
import { User } from '../models/index.js';

/**
 * @description retrieves all Users
 * @route /api/users/
 * @method GET
 */
export const getAllUsers = async (_: Request, res: Response) => {
  const users = await User.findAll();
  res.json(users);
};
