import { Request, Response } from 'express';
import { enqueueEmail } from '../services/emailOutboxService.js';
import { EMAIL_USER } from '../utils/config.js';
import { generateTokenLink } from '../services/authService.js';

/**
 * @description send an email to acknowledge message received
 * @route /api/email
 * @method POST
 * @returns {Response}
 */
export const handleNewMessage = async (req: Request, res: Response) => {
  const { contactDetails } = req.body;
  await enqueueEmail({
    payload: {
      receiver: contactDetails.email,
      option: 'message auto reply',
    },
    eventType: 'message.auto_reply',
  });
  // Avoid concurrent connections by delaying the internal notification.
  if (!EMAIL_USER) {
    throw new Error('EMAIL_USER must be defined in environment variables');
  }
  await enqueueEmail({
    payload: {
      receiver: EMAIL_USER,
      option: 'message submission',
      contactDetails,
    },
    eventType: 'message.submission',
    availableAt: new Date(Date.now() + 3000),
  });
  res.status(200).json({
    success: true,
    message:
      'Message has been received. You can expect a response in a timely manner.',
  });
};

export const sendPasswordReset = async (req: Request, res: Response) => {
  const emailLink = await generateTokenLink(req.body.email);
  await enqueueEmail({
    payload: {
      receiver: req.body.email,
      emailLink,
      option: 'reset password',
    },
    eventType: 'auth.reset_password',
  });
  res.status(200).json({
    success: true,
    message:
      'If an user exists with this email, an email with reset instructions has been sent.',
  });
};
