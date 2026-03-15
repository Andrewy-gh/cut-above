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

const resolveFromEmail = () =>
  process.env.RESEND_FROM ??
  process.env.RESEND_FROM_EMAIL ??
  process.env.EMAIL_FROM ??
  process.env.EMAIL_USER ??
  process.env.DEV_EMAIL_USER ??
  "";

const resolveResendApiKey = () =>
  process.env.RESEND_API_KEY ??
  process.env.RESEND_TOKEN ??
  "";

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

export const sendEmailResend = internalAction({
  args: {
    dedupeKey: v.string(),
    receiver: v.string(),
    subject: v.string(),
    text: v.string(),
  },
  handler: async (_ctx, args): Promise<{ messageId?: string }> => {
    const apiKey = resolveResendApiKey();
    const from = resolveFromEmail();

    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY for email delivery.");
    }

    if (!from) {
      throw new Error(
        "Missing sender email for Resend delivery. Set RESEND_FROM or EMAIL_USER."
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Idempotency-Key": args.dedupeKey,
      },
      body: JSON.stringify({
        from,
        to: [args.receiver],
        subject: args.subject,
        text: args.text,
      }),
    });

    const responseText = await response.text();
    if (!response.ok) {
      const details =
        responseText.length > 0 ? ` ${responseText}` : "";
      throw new Error(`Resend send failed: ${response.status}${details}`);
    }

    try {
      const parsed = JSON.parse(responseText) as Record<string, unknown>;
      const id = parsed.id;
      if (typeof id === "string" && id.length) {
        return { messageId: id };
      }
    } catch {
      // If Resend returns non-JSON payloads, keep the send successful by default.
    }

    return { messageId: undefined };
  },
});

