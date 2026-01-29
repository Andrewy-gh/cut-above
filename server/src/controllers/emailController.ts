import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { Result } from 'better-result';
import { enqueueEmail } from '../services/emailOutboxService.js';
import { EMAIL_USER } from '../utils/config.js';
import { generateTokenLink } from '../services/authService.js';
import { AppError } from '../errors.js';
import { sendProblem } from '../utils/problemDetails.js';

const hashDedupeKey = (value: string) =>
  createHash('sha256').update(value).digest('hex');

/**
 * @description send an email to acknowledge message received
 * @route /api/email
 * @method POST
 * @returns {Response}
 */
export const handleNewMessage = async (req: Request, res: Response) => {
  const result = await Result.gen(async function* () {
    const { contactDetails } = req.body;
    const messageIdentity = [
      contactDetails.email,
      contactDetails.firstName ?? '',
      contactDetails.lastName ?? '',
      contactDetails.message ?? '',
    ].join('|');
    yield* Result.await(
      enqueueEmail({
        payload: {
          receiver: contactDetails.email,
          option: 'message auto reply',
        },
        eventType: 'message.auto_reply',
        dedupeKey: `message.auto_reply|${hashDedupeKey(messageIdentity)}`,
      }),
    );
    // Avoid concurrent connections by delaying the internal notification.
    if (!EMAIL_USER) {
      return Result.err(
        new AppError({
          statusCode: 500,
          message: 'EMAIL_USER must be defined in environment variables',
        }),
      );
    }
    yield* Result.await(
      enqueueEmail({
        payload: {
          receiver: EMAIL_USER,
          option: 'message submission',
          contactDetails,
        },
        eventType: 'message.submission',
        dedupeKey: `message.submission|${hashDedupeKey(messageIdentity)}`,
        availableAt: new Date(Date.now() + 3000),
      }),
    );
    return Result.ok();
  });

  return result.match({
    ok: () =>
      res.status(200).json({
        success: true,
        message:
          'Message has been received. You can expect a response in a timely manner.',
      }),
    err: (error) => sendProblem(res, req, error),
  });
};

export const sendPasswordReset = async (req: Request, res: Response) => {
  const result = await Result.gen(async function* () {
    const emailLink = yield* Result.await(generateTokenLink(req.body.email));
    const dedupeKey = emailLink
      ? `auth.reset_password|${hashDedupeKey(emailLink)}`
      : undefined;
    yield* Result.await(
      enqueueEmail({
        payload: {
          receiver: req.body.email,
          emailLink: emailLink ?? undefined,
          option: 'reset password',
        },
        eventType: 'auth.reset_password',
        dedupeKey,
      }),
    );
    return Result.ok();
  });

  return result.match({
    ok: () =>
      res.status(200).json({
        success: true,
        message:
          'If an user exists with this email, an email with reset instructions has been sent.',
      }),
    err: (error) => sendProblem(res, req, error),
  });
};
