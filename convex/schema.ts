import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

import {
  appointmentStatusValidator,
  emailDeliveryStatusValidator,
  emailEventTypeValidator,
  emailOutboxStatusValidator,
  roleValidator,
  serviceNameValidator,
} from "./lib/domainValidators";

export default defineSchema({
  users: defineTable({
    id: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    role: roleValidator,
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index('by_email', ['email'])
    .index('by_user_id', ['id'])
    .index('by_role', ['role']),
  schedules: defineTable({
    id: v.string(),
    date: v.string(),
    open: v.string(),
    close: v.string(),
  })
    .index('by_date', ['date'])
    .index('by_schedule_id', ['id'])
    .index('by_open', ['open']),
  appointments: defineTable({
    id: v.string(),
    status: appointmentStatusValidator,
    service: serviceNameValidator,
    start: v.string(),
    end: v.string(),
    clientId: v.string(),
    employeeId: v.string(),
    scheduleId: v.string(),
  })
    .index('by_appointment_id', ['id'])
    .index('by_client', ['clientId'])
    .index('by_employee', ['employeeId'])
    .index('by_schedule', ['scheduleId']),
  appointmentAccessTokens: defineTable({
    appointmentId: v.string(),
    tokenHash: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index('by_token_hash', ['tokenHash'])
    .index('by_appointment_id', ['appointmentId']),
  emailOutbox: defineTable({
    id: v.string(),
    eventType: emailEventTypeValidator,
    dedupeKey: v.string(),
    payload: v.any(),
    status: emailOutboxStatusValidator,
    attempts: v.number(),
    availableAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_outbox_id', ['id'])
    .index('by_status_available_at', ['status', 'availableAt'])
    .index('by_dedupe_key', ['dedupeKey']),
  emailDeliveries: defineTable({
    id: v.string(),
    dedupeKey: v.string(),
    status: emailDeliveryStatusValidator,
    providerMessageId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_delivery_id', ['id'])
    .index('by_dedupe_key', ['dedupeKey']),
});
