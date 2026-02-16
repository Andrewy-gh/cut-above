"use node";

import nodemailer from "nodemailer";
import { v } from "convex/values";

import { internalAction } from "./_generated/server";

const resolveEmailConfig = () => ({
  host: process.env.EMAIL_HOST ?? process.env.DEV_EMAIL_HOST ?? "",
  port: Number(process.env.EMAIL_PORT ?? process.env.DEV_EMAIL_PORT ?? "0"),
  secure: (process.env.EMAIL_SECURE ?? process.env.DEV_EMAIL_SECURE ?? "false")
    .toLowerCase()
    .trim() === "true",
  service: process.env.EMAIL_SERVICE ?? process.env.DEV_EMAIL_SERVICE ?? "",
  user: process.env.EMAIL_USER ?? process.env.DEV_EMAIL_USER ?? "",
  pass: process.env.EMAIL_PASSWORD ?? process.env.DEV_EMAIL_PASSWORD ?? "",
});

export const sendEmailSmtp = internalAction({
  args: {
    receiver: v.string(),
    subject: v.string(),
    text: v.string(),
  },
  handler: async (_ctx, args): Promise<{ messageId?: string }> => {
    const { host, port, secure, service, user, pass } = resolveEmailConfig();
    const useHost = Boolean(host);
    if (!useHost && (!service || !user || !pass)) {
      throw new Error(
        "Missing EMAIL_SERVICE, EMAIL_USER, or EMAIL_PASSWORD for email delivery."
      );
    }

    const transporter = nodemailer.createTransport(
      useHost
        ? {
            host,
            port: port || 25,
            secure,
            ...(user && pass ? { auth: { user, pass } } : {}),
          }
        : {
            service,
            auth: {
              user,
              pass,
            },
          }
    );

    const result = await transporter.sendMail({
      from: user,
      to: args.receiver,
      subject: args.subject,
      text: args.text,
    });

    return { messageId: result?.messageId ?? undefined };
  },
});

