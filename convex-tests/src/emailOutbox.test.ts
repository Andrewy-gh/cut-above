import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { internal } from "../../convex/_generated/api";
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

describe("emailOutbox.processOutbox", () => {
  const envBackup: Record<string, string | undefined> = {};

  beforeEach(() => {
    [
      "EMAIL_DELIVERY_MODE",
      "EMAIL_SERVICE",
      "DEV_EMAIL_SERVICE",
      "EMAIL_USER",
      "DEV_EMAIL_USER",
      "EMAIL_PASSWORD",
      "DEV_EMAIL_PASSWORD",
    ].forEach((key) => {
      envBackup[key] = process.env[key];
    });
  });

  afterEach(() => {
    Object.entries(envBackup).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  });

  it("marks pending outbox items as sent and records delivery status", async () => {
    process.env.EMAIL_DELIVERY_MODE = "log";
    const t = createConvexTest();
    const outboxId = await insertOutboxItem(t, {
      dedupeKey: "dedupe-sent",
    });

    await t.action(internal.emailOutboxActions.processOutbox, {});

    const outbox = await t.run((ctx) => ctx.db.get(outboxId));
    expect(outbox?.status).toBe("sent");

    const delivery = await t.run((ctx) =>
      ctx.db
        .query("emailDeliveries")
        .withIndex("by_dedupe_key", (q) => q.eq("dedupeKey", "dedupe-sent"))
        .first()
    );
    expect(delivery?.status).toBe("sent");
  });

  it("schedules a retry when delivery fails", async () => {
    delete process.env.EMAIL_DELIVERY_MODE;
    delete process.env.EMAIL_SERVICE;
    delete process.env.DEV_EMAIL_SERVICE;
    delete process.env.EMAIL_USER;
    delete process.env.DEV_EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
    delete process.env.DEV_EMAIL_PASSWORD;

    const t = createConvexTest();
    const outboxId = await insertOutboxItem(t, {
      dedupeKey: "dedupe-retry",
    });

    await t.action(internal.emailOutboxActions.processOutbox, {});

    const outbox = await t.run((ctx) => ctx.db.get(outboxId));
    expect(outbox?.status).toBe("pending");
    expect(outbox?.attempts).toBe(1);
    expect(outbox?.availableAt).toBeGreaterThan(outbox?.updatedAt ?? 0);

    const delivery = await t.run((ctx) =>
      ctx.db
        .query("emailDeliveries")
        .withIndex("by_dedupe_key", (q) => q.eq("dedupeKey", "dedupe-retry"))
        .first()
    );
    expect(delivery?.status).toBe("failed");
  });
});
