import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    id: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    role: v.string(),
    passwordHash: v.optional(v.string()),
    image: v.optional(v.string()),
    profile: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_id", ["id"])
    .index("by_role", ["role"]),
  schedules: defineTable({
    id: v.string(),
    date: v.string(),
    open: v.string(),
    close: v.string(),
  })
    .index("by_date", ["date"])
    .index("by_open", ["open"]),
  appointments: defineTable({
    id: v.string(),
    status: v.string(),
    service: v.string(),
    start: v.string(),
    end: v.string(),
    clientId: v.string(),
    employeeId: v.string(),
    scheduleId: v.string(),
  })
    .index("by_id", ["id"])
    .index("by_client", ["clientId"])
    .index("by_employee", ["employeeId"])
    .index("by_schedule", ["scheduleId"]),
  passwordResetTokens: defineTable({
    id: v.string(),
    userId: v.string(),
    tokenHash: v.string(),
    timesUsed: v.number(),
    expiresAt: v.number(),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_user", ["userId"])
    .index("by_expires_at", ["expiresAt"]),
  emailOutbox: defineTable({
    id: v.string(),
    eventType: v.string(),
    dedupeKey: v.string(),
    payload: v.any(),
    status: v.string(),
    attempts: v.number(),
    availableAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status_available_at", ["status", "availableAt"])
    .index("by_dedupe_key", ["dedupeKey"]),
  emailDeliveries: defineTable({
    id: v.string(),
    dedupeKey: v.string(),
    status: v.string(),
    providerMessageId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_dedupe_key", ["dedupeKey"]),
});
