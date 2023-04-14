const bcrypt = require('bcrypt');
const registerRouter = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

registerRouter.post('/signup', async (request, response) => {
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
  s;
  await newUser.save();

  response
    .status(201)
    .send({ success: true, message: 'Successfully registered account' });
});

module.exports = registerRouter;
