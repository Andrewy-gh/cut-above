import logger from '../utils/logger/index.js';
import nodemailer from 'nodemailer';
import { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD } from '../utils/config.js';
import { options } from '../utils/emailOptions.js';

export type EmailOption =
  | "confirmation"
  | "modification"
  | "cancellation"
  | "reset password"
  | "reset password success"
  | "message auto reply"
  | "message submission";

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
  attempt?: number;
}

export const sendEmail = async ({
  receiver,
  employee,
  date,
  time,
  option,
  emailLink,
  contactDetails,
}: EmailData) => {
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
    employee || "",
    date || "",
    time || "",
    option || "confirmation",
    emailLink || "",
    contactDetails,
  );

  const fullEmailOptions = { ...senderReceiverOptions, ...emailTemplate };

  // Send Email
  try {
    const info = await transporter.sendMail(fullEmailOptions);
    logger.info(`accepted ${info.accepted}`);
    logger.error(`rejected ${info.rejected}`);
    logger.info(`response: ${info.response}`);
    return info;
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
