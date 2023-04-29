const employeeRouter = require('express').Router();
const User = require('../models/User');

employeeRouter.get('/', async (request, response) => {
  const employees = await User.find({ role: 'employee' });
  response.status(200).json(employees);
});

module.exports = employeeRouter;
