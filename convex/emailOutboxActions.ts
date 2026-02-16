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

const isEmailPayload = (value: unknown): value is EmailPayload =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { receiver?: unknown }).receiver === "string";

type EmailSendResult = { messageId?: string };

const normalizeDeliveryMode = (value: string) => value.toLowerCase().trim();

const getDeliveryMode = () =>
  normalizeDeliveryMode(process.env.EMAIL_DELIVERY_MODE ?? "smtp");

const getMailpitUrl = () =>
  (process.env.MAILPIT_URL ?? process.env.DEV_MAILPIT_URL ?? "").trim();

const isLocalDeployment = () =>
  (process.env.CONVEX_DEPLOYMENT ?? "").toLowerCase().startsWith("local:");

const sendEmailViaMailpitHttp = async (
  payload: EmailPayload
): Promise<EmailSendResult> => {
  const mailpitUrl = getMailpitUrl().replace(/\/+$/, "");
  if (!mailpitUrl) {
    throw new Error("Missing MAILPIT_URL for Mailpit HTTP delivery.");
  }

  const from =
    process.env.EMAIL_USER ??
    process.env.DEV_EMAIL_USER ??
    "no-reply@cutabove.local";

  const template = buildEmailTemplate(payload);
  const response = await fetch(`${mailpitUrl}/api/v1/send`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      From: { Email: from },
      To: [{ Email: payload.receiver }],
      Subject: template.subject,
      Text: template.text,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mailpit send failed: ${response.status} ${text}`);
  }

  try {
    const data = (await response.json()) as Record<string, unknown>;
    const id = data.ID ?? data.Id ?? data.id;
    if (typeof id === "string" && id.length) return { messageId: id };
  } catch {
    // ignore JSON parse errors; Mailpit may return an empty body.
  }

  return { messageId: "mailpit" };
};

const sendEmailViaSmtp = async (
  ctx: ActionCtx,
  payload: EmailPayload
): Promise<EmailSendResult> => {
  const template = buildEmailTemplate(payload);
  return ctx.runAction(internal.emailOutboxNodeActions.sendEmailSmtp, {
    receiver: payload.receiver,
    subject: template.subject,
    text: template.text,
  });
};

const sendEmail = async (
  ctx: ActionCtx,
  payload: EmailPayload
): Promise<EmailSendResult> => {
  const mode = getDeliveryMode();

  if (mode === "log") {
    console.info("Email delivery disabled; logging payload.", payload);
    return { messageId: "log" };
  }

  // Local deployments on Windows have hit Node ESM loader errors. Prefer Mailpit's
  // HTTP API in local dev when MAILPIT_URL is configured.
  if (mode === "mailpit_http") {
    return sendEmailViaMailpitHttp(payload);
  }
  if (mode === "smtp" && isLocalDeployment() && getMailpitUrl()) {
    return sendEmailViaMailpitHttp(payload);
  }
  if (mode === "smtp") {
    return sendEmailViaSmtp(ctx, payload);
  }

  throw new Error(`Unsupported EMAIL_DELIVERY_MODE: ${mode}`);
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
    const result = await sendEmail(ctx, payload);
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
