import logger from "../utils/logger/index.js";
import nodemailer from "nodemailer";
import { pub, sub } from "../utils/redis.js";
import { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD } from "../utils/config.js";
import { options } from "../utils/emailOptions.js";

const MAX_EMAIL_RETRIES = Number(process.env.EMAIL_MAX_RETRIES ?? "3");
const BASE_RETRY_DELAY_MS = Number(
  process.env.EMAIL_RETRY_BASE_DELAY_MS ?? "2000",
);
const MAX_RETRY_DELAY_MS = Number(
  process.env.EMAIL_RETRY_MAX_DELAY_MS ?? "60000",
);

type EmailOption =
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

const getRetryDelayMs = (attempt: number) =>
  Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);

const formatErrorMessage = (cause: unknown) =>
  cause instanceof Error ? cause.message : "Unknown error";

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
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

export const listenForMessage = async (lastId: string = "$") => {
  // `results` is an array, each element of which corresponds to a key.
  // Because we only listen to one key (mystream) here, `results` only contains
  // a single element. See more: https://redis.io/commands/xread#return-value
  const results = await sub.xread(
    "BLOCK",
    0,
    "STREAMS",
    "email-stream",
    lastId,
  );
  if (!results) return;
  const [, messages] = results[0]; // `key` equals to "user-stream"

  messages.forEach((message) => {
    const payloadString = message[1][1];
    let payload: EmailData;
    try {
      payload = JSON.parse(payloadString) as EmailData;
    } catch (cause) {
      logger.error(`Failed to parse email payload: ${formatErrorMessage(cause)}`);
      return;
    }

    logger.info(`Id: ${message[0]}. Data: ${message[1]}`);
    void (async () => {
      try {
        await sendEmail(payload);
      } catch (cause) {
        const attempt = payload.attempt ?? 0;
        if (attempt >= MAX_EMAIL_RETRIES) {
          logger.error(
            `Email failed after ${attempt} retries: ${formatErrorMessage(cause)}`,
          );
          return;
        }

        const nextAttempt = attempt + 1;
        const delayMs = getRetryDelayMs(attempt);
        logger.warn(
          `Email send failed. Retrying in ${delayMs}ms (attempt ${nextAttempt}/${MAX_EMAIL_RETRIES}).`,
        );

        setTimeout(() => {
          void publishMessage({ ...payload, attempt: nextAttempt }).catch(
            (publishError) => {
              logger.error(
                `Failed to requeue email: ${formatErrorMessage(publishError)}`,
              );
            },
          );
        }, delayMs);
      }
    })();
  });

  // Pass the last id of the results to the next round.
  await listenForMessage(messages[messages.length - 1][0]);
};

export const publishMessage = async (obj: EmailData) => {
  await pub.xadd(
    "email-stream",
    "MAXLEN",
    "100",
    "*",
    "data",
    JSON.stringify(obj),
  );
};
