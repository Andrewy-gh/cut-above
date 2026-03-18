import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
      "EMAIL_HOST",
      "EMAIL_PORT",
      "EMAIL_SECURE",
      "EMAIL_SERVICE",
      "DEV_EMAIL_SERVICE",
      "DEV_EMAIL_HOST",
      "DEV_EMAIL_PORT",
      "DEV_EMAIL_SECURE",
      "EMAIL_USER",
      "DEV_EMAIL_USER",
      "EMAIL_PASSWORD",
      "DEV_EMAIL_PASSWORD",
      "RESEND_API_KEY",
      "RESEND_FROM",
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
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_PORT;
    delete process.env.EMAIL_SECURE;
    delete process.env.EMAIL_SERVICE;
    delete process.env.DEV_EMAIL_SERVICE;
    delete process.env.DEV_EMAIL_HOST;
    delete process.env.DEV_EMAIL_PORT;
    delete process.env.DEV_EMAIL_SECURE;
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

  it("passes the outbox dedupe key to Resend as an idempotency header", async () => {
    process.env.EMAIL_DELIVERY_MODE = "resend";
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.RESEND_FROM = "no-reply@example.com";

    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ id: "resend-message-id" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const t = createConvexTest();
      const dedupeKey = "dedupe-resend-idempotency";
      await insertOutboxItem(t, { dedupeKey });

      await t.action(internal.emailOutboxActions.processOutbox, {});

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, requestInit] = fetchMock.mock.calls[0] ?? [];
      expect(requestInit).toMatchObject({
        headers: expect.objectContaining({
          Authorization: "Bearer test-resend-key",
          "Idempotency-Key": dedupeKey,
        }),
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
