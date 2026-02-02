"use node";

import nodemailer from "nodemailer";
import { v } from "convex/values";

import {
  internalAction,
  internalMutation,
  internalQuery,
  type ActionCtx,
} from "./_generated/server";
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

export const claimOutboxBatch = internalMutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? DEFAULT_BATCH_SIZE;
    const now = Date.now();
    const items = await ctx.db
      .query("emailOutbox")
      .withIndex("by_status_available_at", (q) =>
        q.eq("status", "pending").lte("availableAt", now)
      )
      .take(limit);

    if (items.length === 0) return [];

    await Promise.all(
      items.map((item) =>
        ctx.db.patch(item._id, { status: "processing", updatedAt: now })
      )
    );

    return items;
  },
});

export const getDeliveryByDedupeKey = internalQuery({
  args: { dedupeKey: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("emailDeliveries")
      .withIndex("by_dedupe_key", (q) => q.eq("dedupeKey", args.dedupeKey))
      .first(),
});

export const upsertDeliveryStatus = internalMutation({
  args: {
    dedupeKey: v.string(),
    status: v.string(),
    providerMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("emailDeliveries")
      .withIndex("by_dedupe_key", (q) => q.eq("dedupeKey", args.dedupeKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        providerMessageId: args.providerMessageId ?? existing.providerMessageId,
        updatedAt: now,
      });
      return existing._id;
    }

    const id = crypto.randomUUID();
    return ctx.db.insert("emailDeliveries", {
      id,
      dedupeKey: args.dedupeKey,
      status: args.status,
      providerMessageId: args.providerMessageId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const markOutboxSent = internalMutation({
  args: { outboxId: v.id("emailOutbox") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.outboxId, {
      status: "sent",
      updatedAt: Date.now(),
    });
  },
});

export const markOutboxFailed = internalMutation({
  args: { outboxId: v.id("emailOutbox"), attempts: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.outboxId, {
      status: "failed",
      attempts: args.attempts,
      updatedAt: Date.now(),
    });
  },
});

export const scheduleOutboxRetry = internalMutation({
  args: {
    outboxId: v.id("emailOutbox"),
    attempts: v.number(),
    availableAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.outboxId, {
      status: "pending",
      attempts: args.attempts,
      availableAt: args.availableAt,
      updatedAt: Date.now(),
    });
  },
});

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
  handler: async (ctx, args) => {
    const items = await ctx.runMutation(internal.emailOutbox.claimOutboxBatch, {
      limit: args.limit,
    });

    if (items.length === 0) {
      return { processed: 0 };
    }

    for (const item of items) {
      await processOutboxItem(ctx, item);
    }

    return { processed: items.length };
  },
});
