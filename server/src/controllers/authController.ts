import { Request, Response } from 'express';
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
import { enqueueEmail } from '../services/emailOutboxService.js';
import ApiError from '../utils/ApiError.js';

/**
 * @description register user
 * @route /signup
 * @method POST
 */
export const register = async (req: Request, res: Response) => {
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
export const login = async (req: Request, res: Response) => {
  const user = await authenticateUser(req.body);
  req.session.userId = user.id;
  req.session.isAdmin = user.role === 'admin';

  // Explicitly save session (required for tests and some configurations)
  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  res
    .status(200)
    .json({ success: true, message: 'Successfully logged in', user: user });
};

/**
 * @description logout user
 * @route /logout
 * @method POST
 */
export const logout = async (req: Request, res: Response) => {
  const userId = req.session.userId;
  let user: User | null = null;
  if (userId) {
    user = await User.findByPk(userId);
  }
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
    secure: process.env.NODE_ENV === 'development' ? false : true, // if true: only transmit cookie over https, in prod, always activate this
  });
  res.status(204).end();
};

/**
 * @description change email
 * @route /email
 * @method PUT
 */
export const changeEmail = async (req: Request, res: Response) => {
  const user = await updateEmail({
    email: req.body.email,
    id: req.session.userId!,
  });
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
export const changePassword = async (req: Request, res: Response) => {
  await updatePassword({
    password: req.body.password,
    id: req.session.userId!,
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
export const handleTokenValidation = async (req: Request, res: Response) => {
  await validateToken(req.params as { id: string; token: string });
  res.json({ success: true, message: 'Token is valid' });
};

/**
 * @description reset password after token is validated
 * @route /reset-pw/:id/:token
 * @method PUT
 */
export const handlePasswordReset = async (req: Request, res: Response) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new ApiError(400, 'Bad Request');
  }
  await resetPassword(user, req.body.password);
  await enqueueEmail({
    payload: {
      receiver: user.email,
      option: 'reset password success',
    },
    eventType: 'auth.reset_password_success',
  });
  res.status(200).json({ success: true, message: 'Password updated' });
};
