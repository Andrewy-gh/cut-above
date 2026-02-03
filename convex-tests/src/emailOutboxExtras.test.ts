import { describe, expect, it } from "vitest";

import { api, internal } from "../../convex/_generated/api";
import { enqueueEmail } from "../../convex/lib/emailOutbox";
import { createConvexTest } from "./convexTest";

const basePayload = {
  receiver: "client@example.com",
  employee: "Staff",
  date: "2026-02-02",
  time: "2:00pm",
  option: "confirmation",
  emailLink: "http://localhost:5173/appointment/123",
};

const insertOutboxItem = async (
  t: ReturnType<typeof createConvexTest>,
  overrides: Partial<{
    dedupeKey: string;
    payload: Record<string, unknown>;
    attempts: number;
  }> = {}
) => {
  const now = Date.now();
  const dedupeKey = overrides.dedupeKey ?? `dedupe-${crypto.randomUUID()}`;
  const payload = overrides.payload ?? basePayload;
  const attempts = overrides.attempts ?? 0;

  return t.run((ctx) =>
    ctx.db.insert("emailOutbox", {
      id: `outbox-${crypto.randomUUID()}`,
      eventType: "appointment.confirmation",
      dedupeKey,
      payload,
      status: "pending",
      attempts,
      availableAt: now - 1000,
      createdAt: now,
      updatedAt: now,
    })
  );
};

describe("email outbox critical cases", () => {
  it("dedupes by dedupeKey", async () => {
    const t = createConvexTest();

    const firstId = await t.run((ctx) =>
      enqueueEmail(ctx, {
        payload: { receiver: "one@example.com", option: "confirmation" },
        eventType: "appointment.confirmation",
        dedupeKey: "dedupe-fixed",
      })
    );

    const secondId = await t.run((ctx) =>
      enqueueEmail(ctx, {
        payload: { receiver: "two@example.com", option: "confirmation" },
        eventType: "appointment.confirmation",
        dedupeKey: "dedupe-fixed",
      })
    );

    expect(secondId).toBe(firstId);

    const items = await t.run((ctx) =>
      ctx.db
        .query("emailOutbox")
        .withIndex("by_dedupe_key", (q) => q.eq("dedupeKey", "dedupe-fixed"))
        .collect()
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.payload).toMatchObject({ receiver: "one@example.com" });
  });

  it("enqueues auto-reply and internal notification for contact form", async () => {
    const originalEmailUser = process.env.EMAIL_USER;
    const originalDevEmailUser = process.env.DEV_EMAIL_USER;
    process.env.EMAIL_USER = "owner@cutabove.test";
    process.env.DEV_EMAIL_USER = "";

    try {
      const t = createConvexTest();
      await t.mutation(api.email.sendMessage, {
        contactDetails: {
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          message: "Hello",
        },
      });

      const items = await t.run((ctx) =>
        ctx.db.query("emailOutbox").collect()
      );

      expect(items).toHaveLength(2);
      const receivers = items.map((item) => item.payload?.receiver).sort();
      expect(receivers).toEqual(["ada@example.com", "owner@cutabove.test"]);
    } finally {
      process.env.EMAIL_USER = originalEmailUser;
      process.env.DEV_EMAIL_USER = originalDevEmailUser;
    }
  });

  it("marks outbox failed after max retries", async () => {
    const envBackup = {
      EMAIL_DELIVERY_MODE: process.env.EMAIL_DELIVERY_MODE,
      EMAIL_SERVICE: process.env.EMAIL_SERVICE,
      DEV_EMAIL_SERVICE: process.env.DEV_EMAIL_SERVICE,
      EMAIL_USER: process.env.EMAIL_USER,
      DEV_EMAIL_USER: process.env.DEV_EMAIL_USER,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
      DEV_EMAIL_PASSWORD: process.env.DEV_EMAIL_PASSWORD,
      EMAIL_MAX_RETRIES: process.env.EMAIL_MAX_RETRIES,
    };

    delete process.env.EMAIL_DELIVERY_MODE;
    delete process.env.EMAIL_SERVICE;
    delete process.env.DEV_EMAIL_SERVICE;
    delete process.env.EMAIL_USER;
    delete process.env.DEV_EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
    delete process.env.DEV_EMAIL_PASSWORD;
    process.env.EMAIL_MAX_RETRIES = "1";

    try {
      const t = createConvexTest();
      const outboxId = await insertOutboxItem(t, { dedupeKey: "dedupe-max" });

      await t.action(internal.emailOutboxActions.processOutbox, {});

      const outbox = await t.run((ctx) => ctx.db.get(outboxId));
      expect(outbox?.status).toBe("failed");
      expect(outbox?.attempts).toBe(1);
    } finally {
      Object.entries(envBackup).forEach(([key, value]) => {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      });
    }
  });
});
