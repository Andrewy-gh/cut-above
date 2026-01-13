import { User } from '../models/index.js';

export const findById = async (id: string) => {
  return await User.findByPk(id);
};
