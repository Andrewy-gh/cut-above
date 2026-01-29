import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { Result } from 'better-result';
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
import {
  AppError,
  DatabaseError,
  SessionError,
  ValidationError,
} from '../errors.js';
import { sendProblem } from '../utils/problemDetails.js';

const hashDedupeKey = (value: string) =>
  createHash('sha256').update(value).digest('hex');

/**
 * @description register user
 * @route /signup
 * @method POST
 */
export const register = async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  return result.match({
    ok: () =>
      res
        .status(200)
        .json({ success: true, message: 'Successfully registered account' }),
    err: (error) => sendProblem(res, req, error),
  });
};

/**
 * @description login user
 * @route /login
 * @method POST
 */
export const login = async (req: Request, res: Response) => {
  const result = await Result.gen(async function* () {
    const user = yield* Result.await(authenticateUser(req.body));
    req.session.userId = user.id;
    req.session.isAdmin = user.role === 'admin';

    // Explicitly save session (required for tests and some configurations)
    yield* Result.await(
      Result.tryPromise({
        try: () =>
          new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) reject(err);
              else resolve();
            });
          }),
        catch: (cause) =>
          new AppError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to persist session',
            cause,
          }),
      }),
    );

    return Result.ok(user);
  });

  return result.match({
    ok: (user) =>
      res
        .status(200)
        .json({ success: true, message: 'Successfully logged in', user }),
    err: (error) => sendProblem(res, req, error),
  });
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
    const userResult = await Result.tryPromise({
      try: () => User.findByPk(userId),
      catch: (cause) =>
        new DatabaseError({
          statusCode: 500,
          message:
            cause instanceof Error
              ? cause.message
              : 'Failed to lookup user',
          cause,
        }),
    });
    if (userResult.status === 'ok') {
      user = userResult.value;
    } else {
      logger.error('Error performing logout:');
      logger.error(userResult.error);
    }
  }

  const destroyResult = await Result.tryPromise({
    try: () =>
      new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) reject(err);
          else resolve();
        });
      }),
    catch: (cause) =>
      new AppError({
        statusCode: 500,
        message:
          cause instanceof Error ? cause.message : 'Failed to destroy session',
        cause,
      }),
  });

  if (destroyResult.status === 'error') {
    logger.error('Error performing logout:');
    logger.error(destroyResult.error);
  } else if (user) {
    logger.info(`Logged out user ${user.email}.`);
  } else {
    logger.info('Logout called by a user without a session.');
  }
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
  const userId = req.session.userId;
  if (!userId) {
    return sendProblem(
      res,
      req,
      new SessionError({
        statusCode: 401,
        message: 'Session expired',
      }),
    );
  }

  const result = await updateEmail({
    email: req.body.email,
    id: userId,
  });
  return result.match({
    ok: (user) =>
      res.status(200).json({
        success: true,
        message: 'User email successfully changed',
        user,
      }),
    err: (error) => sendProblem(res, req, error),
  });
};

/**
 * @description change password
 * @route /password
 * @method PUT
 */
export const changePassword = async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    return sendProblem(
      res,
      req,
      new SessionError({
        statusCode: 401,
        message: 'Session expired',
      }),
    );
  }

  const result = await updatePassword({
    password: req.body.password,
    id: userId,
  });

  return result.match({
    ok: () =>
      res
        .status(200)
        .json({ success: true, message: 'User password successfully changed' }),
    err: (error) => sendProblem(res, req, error),
  });
};

/**
 * @description endpoint for token validation
 * @route /validation/:id/:token
 * @method GET
 */
export const handleTokenValidation = async (req: Request, res: Response) => {
  const result = await validateToken(req.params as { id: string; token: string });
  return result.match({
    ok: () => res.json({ success: true, message: 'Token is valid' }),
    err: (error) => sendProblem(res, req, error),
  });
};

/**
 * @description reset password after token is validated
 * @route /reset-pw/:id/:token
 * @method PUT
 */
export const handlePasswordReset = async (req: Request, res: Response) => {
  const result = await Result.gen(async function* () {
    const user = yield* Result.await(
      Result.tryPromise({
        try: () => User.findByPk(req.params.id),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to reset password',
            cause,
          }),
      }),
    );
    if (!user) {
      return Result.err(
        new ValidationError({ statusCode: 400, message: 'Bad Request' }),
      );
    }
    yield* Result.await(resetPassword(user, req.body.password));
    yield* Result.await(
      enqueueEmail({
        payload: {
          receiver: user.email,
          option: 'reset password success',
        },
        eventType: 'auth.reset_password_success',
        dedupeKey: `auth.reset_password_success|${hashDedupeKey(
          `${req.params.id}|${req.params.token}`,
        )}`,
      }),
    );
    return Result.ok();
  });

  return result.match({
    ok: () => res.status(200).json({ success: true, message: 'Password updated' }),
    err: (error) => sendProblem(res, req, error),
  });
};
