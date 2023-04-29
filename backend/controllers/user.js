const userRouter = require('express').Router();
const User = require('../models/User');

userRouter.get('/', async (request, response) => {
  const users = await User.find({});
  response.status(200).json(users);
});

module.exports = userRouter;
