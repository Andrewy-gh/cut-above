import { v } from "convex/values";

import {
  internalMutation,
  internalQuery,
} from "./_generated/server";

const DEFAULT_BATCH_SIZE = Number(process.env.EMAIL_OUTBOX_BATCH_SIZE ?? "10");

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
