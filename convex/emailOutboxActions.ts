"use node";

import nodemailer from "nodemailer";
import { v } from "convex/values";

import { internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { buildEmailTemplate, type EmailPayload } from "./lib/emailTemplates";

const DEFAULT_BATCH_SIZE = Number(process.env.EMAIL_OUTBOX_BATCH_SIZE ?? "10");
const MAX_EMAIL_RETRIES = Number(process.env.EMAIL_MAX_RETRIES ?? "3");
const BASE_RETRY_DELAY_MS = Number(process.env.EMAIL_RETRY_BASE_DELAY_MS ?? "2000");
const MAX_RETRY_DELAY_MS = Number(process.env.EMAIL_RETRY_MAX_DELAY_MS ?? "60000");

const getRetryDelayMs = (attempt: number) =>
  Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);

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

const isEmailPayload = (value: unknown): value is EmailPayload =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { receiver?: unknown }).receiver === "string";

const sendEmail = async (payload: EmailPayload) => {
  if (process.env.EMAIL_DELIVERY_MODE === "log") {
    console.info("Email delivery disabled; logging payload.", payload);
    return { messageId: "log" };
  }

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

  const template = buildEmailTemplate(payload);
  return transporter.sendMail({
    from: user,
    to: payload.receiver,
    subject: template.subject,
    text: template.text,
  });
};

const processOutboxItem = async (
  ctx: ActionCtx,
  item: Doc<"emailOutbox">
) => {
  if (!isEmailPayload(item.payload)) {
    await ctx.runMutation(internal.emailOutbox.markOutboxFailed, {
      outboxId: item._id,
      attempts: item.attempts + 1,
    });
    return;
  }

  const payload = item.payload;
  const delivery = await ctx.runQuery(internal.emailOutbox.getDeliveryByDedupeKey, {
    dedupeKey: item.dedupeKey,
  });

  if (delivery?.status === "sent") {
    await ctx.runMutation(internal.emailOutbox.markOutboxSent, {
      outboxId: item._id,
    });
    return;
  }

  await ctx.runMutation(internal.emailOutbox.upsertDeliveryStatus, {
    dedupeKey: item.dedupeKey,
    status: "sending",
  });

  try {
    const result = await sendEmail(payload);
    await ctx.runMutation(internal.emailOutbox.upsertDeliveryStatus, {
      dedupeKey: item.dedupeKey,
      status: "sent",
      providerMessageId: result?.messageId ?? undefined,
    });
    await ctx.runMutation(internal.emailOutbox.markOutboxSent, {
      outboxId: item._id,
    });
  } catch (error) {
    console.error("Email send failed", error);
    await ctx.runMutation(internal.emailOutbox.upsertDeliveryStatus, {
      dedupeKey: item.dedupeKey,
      status: "failed",
    });

    const nextAttempts = item.attempts + 1;
    if (nextAttempts >= MAX_EMAIL_RETRIES) {
      await ctx.runMutation(internal.emailOutbox.markOutboxFailed, {
        outboxId: item._id,
        attempts: nextAttempts,
      });
      return;
    }

    const delayMs = getRetryDelayMs(item.attempts);
    await ctx.runMutation(internal.emailOutbox.scheduleOutboxRetry, {
      outboxId: item._id,
      attempts: nextAttempts,
      availableAt: Date.now() + delayMs,
    });
  }
};

export const processOutbox = internalAction({
  args: { limit: v.optional(v.number()) },
  handler: async (
    ctx: ActionCtx,
    args: { limit?: number }
  ): Promise<{ processed: number }> => {
    const items = (await ctx.runMutation(
      internal.emailOutbox.claimOutboxBatch,
      {
        limit: args.limit ?? DEFAULT_BATCH_SIZE,
      }
    )) as Doc<"emailOutbox">[];

    if (items.length === 0) {
      return { processed: 0 };
    }

    for (const item of items) {
      await processOutboxItem(ctx, item);
    }

    return { processed: items.length };
  },
});
