const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
};

const changeEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findById(req.user);
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email must be unique' });
  }
  user.email = email;
  await user.save();
  res.status(200).json({
    success: true,
    message: 'User email successfully changed',
    user: user.email,
  });
};

const changePassword = async (req, res) => {
  const { password } = req.body;
  const userId = req.user || req.params.id;
  const user = await User.findById(userId);
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  user.passwordHash = passwordHash;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: 'User password successfully changed' });
};

const removeUserData = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user, {
    firstName: '[deleted]',
    lastName: '[deleted]',
    email: '[deleted]',
    passwordHash: '',
    schedule: '[deleted]',
    refreshToken: [],
  });
  await user.save();
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  });
  res.status(200).json({
    success: true,
    message: 'User successfully deleted',
  });
};

const removeEmailToken = async (emailId) => {
  const user = await User.findOne({ emailToken: emailId });
  if (user) {
    user.emailToken = user.emailToken.filter((id) => id !== emailId);
    await user.save();
  }
};

const validateToken = async (req, res) => {
  const { token, option } = req.params;
  let decoded;
  let secret;
  if (option === 'reset') {
    secret = process.env.RESET_TOKEN_SECRET;
  } else if (option === 'email') {
    secret = process.env.EMAIL_TOKEN_SECRET;
  }
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    decoded = jwt.decode(token);
    const { id: emailId } = decoded;
    removeEmailToken(emailId);
    throw new AppError(400, 'Expired token');
    // return res.status(400).json({ error: 'Expired token' });
  }
  res.status(200).json({ message: 'Token is valid' });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
  } catch (err) {
    decoded = jwt.decode(token);
    removeEmailToken(decoded.id);
    throw new AppError(400, 'Expired token, request another reset');
  }
  const user = await User.findOne({ emailToken: decoded.id });
  if (!user) {
    return res
      .status(400)
      .json({ error: 'No user associated with this token' });
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);
  user.passwordHash = passwordHash;
  user.emailToken = user.emailToken.filter((id) => id !== decoded.id);
  await user.save();
  res.status(200).json({ success: true, message: 'Password updated' });
};

module.exports = {
  getAllUsers,
  changeEmail,
  changePassword,
  removeUserData,
  validateToken,
  resetPassword,
};
