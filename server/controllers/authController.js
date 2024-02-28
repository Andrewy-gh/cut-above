import logger from '../utils/logger/index.js';
import {
  authenticateUser,
  registerUser,
  updateEmail,
  resetPassword,
  validateToken,
  updatePassword,
} from '../services/authService.js';
import { User } from '../models/index.js';
import { publishMessage } from '../services/emailService.js';

/**
 * @description register user
 * @route /signup
 * @method POST
 */
export const register = async (req, res) => {
  await registerUser(req.body);
  res
    .status(200)
    .json({ success: true, message: 'Successfully registered account' });
};

/**
 * @description login user
 * @route /login
 * @method POST
 */
export const login = async (req, res) => {
  const user = await authenticateUser(req.body);
  req.session.user = user;
  res
    .status(200)
    .json({ success: true, message: 'Successfully logged in', user: user });
};

/**
 * @description logout user
 * @route /logout
 * @method POST
 */
export const logout = async (req, res) => {
  const { user } = req.session;
  req.session.destroy((err) => {
    if (err) {
      logger.error('Error performing logout:');
      logger.error(err);
    } else if (user) {
      logger.info(`Logged out user ${user.email}.`);
    } else {
      logger.info('Logout called by a user without a session.');
    }
  });
  res.clearCookie('cutabove', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // if true: only transmit cookie over https, in prod, always activate this
  });
  res.status(204).end();
};

/**
 * @description change email
 * @route /email
 * @method PUT
 */
export const changeEmail = async (req, res) => {
  const user = await updateEmail({
    email: req.body.email,
    id: req.session.user.id,
  });
  req.session.user = user;
  res.status(200).json({
    success: true,
    message: 'User email successfully changed',
    user: user,
  });
};

/**
 * @description change password
 * @route /password
 * @method PUT
 */
export const changePassword = async (req, res) => {
  await updatePassword({
    password: req.body.password,
    id: req.session.user.id,
  });
  res
    .status(200)
    .json({ success: true, message: 'User password successfully changed' });
};

/**
 * @description endpoint for token validation
 * @route /validation/:id/:token
 * @method GET
 */
export const handleTokenValidation = async (req, res) => {
  await validateToken(req.params);
  res.json({ success: true, message: 'Token is valid' });
};

/**
 * @description reset password after token is validated
 * @route /reset-pw/:id/:token
 * @method PUT
 */
export const handlePasswordReset = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new ApiError(400, 'Bad Request');
  }
  await resetPassword(user, req.body.password);
  await publishMessage({
    receiver: user.email,
    option: 'reset password success',
  });
  res.status(200).json({ success: true, message: 'Password updated' });
};
