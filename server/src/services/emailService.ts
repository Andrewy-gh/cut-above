import logger from '../utils/logger/index.js';
import nodemailer from 'nodemailer';
import { pub, sub } from '../utils/redis.js';
import { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD } from '../utils/config.js';
import { options } from '../utils/emailOptions.js';

type EmailOption =
  | 'confirmation'
  | 'modification'
  | 'cancellation'
  | 'reset password'
  | 'reset password success'
  | 'message auto reply'
  | 'message submission';

export interface EmailData {
  receiver: string;
  employee?: string;
  date?: string;
  time?: string;
  option?: EmailOption;
  emailLink?: string;
  contactDetails?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const sendEmail = async ({
  receiver,
  employee,
  date,
  time,
  option,
  emailLink,
  contactDetails,
}: EmailData): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  const senderReceiverOptions = {
    from: EMAIL_USER,
    to: receiver,
  };

  const emailTemplate = options(
    employee || '',
    date || '',
    time || '',
    option || 'confirmation',
    emailLink || '',
    contactDetails
  );

  const fullEmailOptions = { ...senderReceiverOptions, ...emailTemplate };

  // Send Email
  try {
    const info = await transporter.sendMail(fullEmailOptions);
    logger.info(`accepted ${info.accepted}`);
    logger.error(`rejected ${info.rejected}`);
    logger.info(`response: ${info.response}`);
  } catch (err) {
    logger.error(err);
  }
};

export const listenForMessage = async (lastId: string = '$'): Promise<void> => {
  // `results` is an array, each element of which corresponds to a key.
  // Because we only listen to one key (mystream) here, `results` only contains
  // a single element. See more: https://redis.io/commands/xread#return-value
  const results = await sub.xread(
    'BLOCK',
    0,
    'STREAMS',
    'email-stream',
    lastId
  );
  if (!results) return;
  const [_key, messages] = results[0]; // `key` equals to "user-stream"

  messages.forEach(async (message) => {
    logger.info(`Id: ${message[0]}. Data: ${message[1]}`);
    await sendEmail(JSON.parse(message[1][1]) as EmailData);
  });

  // Pass the last id of the results to the next round.
  await listenForMessage(messages[messages.length - 1][0]);
};

export const publishMessage = async (obj: EmailData): Promise<void> => {
  await pub.xadd(
    'email-stream',
    'MAXLEN',
    '100',
    '*',
    'data',
    JSON.stringify(obj)
  );
};
