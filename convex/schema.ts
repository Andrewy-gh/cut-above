import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    id: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.string(),
    passwordHash: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_id", ["id"]),
  schedules: defineTable({
    id: v.string(),
    employeeId: v.string(),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    isAvailable: v.boolean(),
  }).index("by_employee_date", ["employeeId", "date"]),
  appointments: defineTable({
    id: v.string(),
    clientId: v.string(),
    employeeId: v.string(),
    scheduleId: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_employee", ["employeeId"])
    .index("by_schedule", ["scheduleId"]),
  passwordResetTokens: defineTable({
    id: v.string(),
    userId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"])
    .index("by_expires_at", ["expiresAt"]),
  emailOutbox: defineTable({
    id: v.string(),
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    status: v.string(),
    retryCount: v.number(),
    nextRetryAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status_next_retry", ["status", "nextRetryAt"]),
  emailDeliveries: defineTable({
    id: v.string(),
    emailId: v.string(),
    status: v.string(),
    messageId: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["emailId"]),
});
