const User = require('../models/User');

const getAllEmployees = async (req, res) => {
  const employees = await User.find({ role: 'employee' });
  res.status(200).json(employees);
};

module.exports = { getAllEmployees };
