import { describe, expect, it } from "vitest";

import { internal } from "../../convex/_generated/api";
import { createConvexTest } from "./convexTest";

const mailpitUrl = process.env.MAILPIT_URL;

const describeMailpit = mailpitUrl ? describe : describe.skip;

const request = async (path: string, init?: RequestInit) => {
  if (!mailpitUrl) {
    throw new Error("MAILPIT_URL is required to run this test.");
  }
  const response = await fetch(`${mailpitUrl}${path}`, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mailpit request failed: ${response.status} ${text}`);
  }
  return response;
};

const listMessages = async () => {
  const response = await request("/api/v1/messages");
  const data = (await response.json()) as {
    messages?: unknown[];
    items?: unknown[];
    Messages?: unknown[];
  };
  return (
    data.messages ??
    data.items ??
    data.Messages ??
    []
  );
};

const clearMessages = async () => {
  await request("/api/v1/messages", { method: "DELETE" });
};

const insertOutboxItem = async (t: ReturnType<typeof createConvexTest>) => {
  const now = Date.now();
  return t.run((ctx) =>
    ctx.db.insert("emailOutbox", {
      id: `outbox-${crypto.randomUUID()}`,
      eventType: "appointment.confirmation",
      dedupeKey: `dedupe-${crypto.randomUUID()}`,
      payload: {
        receiver: "client@example.com",
        employee: "Staff",
        date: "2026-02-02",
        time: "2:00pm",
        option: "confirmation",
        emailLink: "http://localhost:5173/appointment/123",
      },
      status: "pending",
      attempts: 0,
      availableAt: now - 1000,
      createdAt: now,
      updatedAt: now,
    })
  );
};

describeMailpit("emailOutbox.processOutbox (mailpit)", () => {
  it("delivers a real SMTP message to Mailpit", async () => {
    await clearMessages();
    const t = createConvexTest();
    await insertOutboxItem(t);

    await t.action(internal.emailOutbox.processOutbox, {});

    const messages = await listMessages();
    expect(messages.length).toBeGreaterThan(0);
  });
});
