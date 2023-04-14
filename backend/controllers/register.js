const bcrypt = require('bcrypt');
const registerRouter = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

registerRouter.post('/register', async (request, response) => {
  const { firstName, lastName, email, password, role } = request.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return response.status(400).json({ error: 'username must be unique' });
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    firstName,
    lastName,
    email,
    passwordHash,
    role,
  });
  await newUser.save();

  response
    .status(201)
    .send({ message: 'Successfully registered account', user: newUser });
});

module.exports = registerRouter;
