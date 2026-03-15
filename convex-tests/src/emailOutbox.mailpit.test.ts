import { describe, expect, it } from "vitest";

import { internal } from "../../convex/_generated/api";
import { createConvexTest } from "./convexTest";

const mailpitUrl = process.env.MAILPIT_URL;
const emailHost = process.env.EMAIL_HOST;
const emailPort = process.env.EMAIL_PORT;
const emailUser = process.env.EMAIL_USER;

const describeMailpit =
  mailpitUrl && emailHost && emailPort && emailUser ? describe : describe.skip;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

const waitForMailpit = async (timeoutMs = 10_000) => {
  const startedAt = Date.now();
  // Mailpit can take a moment to come up after docker compose.
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await request("/api/v1/messages");
      return;
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Timed out waiting for Mailpit API to become ready.");
};

const clearMessages = async () => {
  await request("/api/v1/messages", { method: "DELETE" });
};

const getMessageId = (message: unknown) => {
  if (!message || typeof message !== "object") return undefined;
  const record = message as Record<string, unknown>;
  const id = record.ID ?? record.Id ?? record.id ?? record._id;
  return typeof id === "string" ? id : undefined;
};

const getMessageSummaryText = (message: unknown) => {
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
};

const fetchMessage = async (id: string) => {
  const response = await request(`/api/v1/message/${id}`);
  return (await response.json()) as unknown;
};

const findString = (value: unknown, needle: string) => {
  if (typeof value === "string") return value.includes(needle);
  if (!value || typeof value !== "object") return false;
  const stack: unknown[] = [value];
  while (stack.length) {
    const current = stack.pop();
    if (typeof current === "string" && current.includes(needle)) return true;
    if (!current || typeof current !== "object") continue;
    for (const v of Object.values(current as Record<string, unknown>)) {
      stack.push(v);
    }
  }
  return false;
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
    if (!mailpitUrl) throw new Error("MAILPIT_URL is required to run this test.");
    if (!emailHost || !emailPort) {
      throw new Error("EMAIL_HOST and EMAIL_PORT are required to send via SMTP.");
    }
    if (!emailUser) {
      throw new Error("EMAIL_USER is required (used as the SMTP 'from' address).");
    }

    await waitForMailpit();
    await clearMessages();
    const t = createConvexTest();
    await insertOutboxItem(t);

    await t.action(internal.emailOutboxActions.processOutbox, {});

    let messages: unknown[] = [];
    for (let attempt = 0; attempt < 40; attempt += 1) {
      messages = await listMessages();
      if (messages.length > 0) break;
      await sleep(250);
    }

    expect(messages.length).toBe(1);

    const id = getMessageId(messages[0]);
    if (!id) {
      throw new Error(`Mailpit message id missing: ${getMessageSummaryText(messages[0])}`);
    }

    const message = await fetchMessage(id);
    expect(findString(message, "Your booking at Cut Above Barbershop:")).toBe(true);
    expect(findString(message, "client@example.com")).toBe(true);
    expect(findString(message, "http://localhost:5173/appointment/123")).toBe(true);
  }, 15_000);
});
