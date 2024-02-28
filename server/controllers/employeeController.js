import { User } from '../models/index.js';

export const getAllEmployees = async (req, res) => {
  const employees = await User.findAll({
    where: { role: 'employee' },
    attributes: {
      exclude: ['lastName', 'email', 'role', 'image', 'profile'],
    },
  });
  res.json(employees);
};

export const getEmployeeProfiles = async (req, res) => {
  const employees = await User.findAll({
    where: { role: 'employee' },
    attributes: {
      exclude: ['lastName', 'email', 'role'],
    },
  });
  res.json(employees);
};
