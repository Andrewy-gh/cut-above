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
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_user_id", ["id"])
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
    .index("by_appointment_id", ["id"])
    .index("by_client", ["clientId"])
    .index("by_employee", ["employeeId"])
    .index("by_schedule", ["scheduleId"]),
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
