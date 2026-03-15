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
  employeeAvailabilityRules: defineTable({
    id: v.string(),
    employeeId: v.string(),
    weekday: v.number(),
    isWorking: v.boolean(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index('by_availability_rule_id', ['id'])
    .index('by_employee', ['employeeId'])
    .index('by_employee_weekday', ['employeeId', 'weekday'])
    .index('by_weekday', ['weekday']),
  employeeAvailabilityOverrides: defineTable({
    id: v.string(),
    employeeId: v.string(),
    date: v.string(),
    isWorking: v.boolean(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    reason: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index('by_availability_override_id', ['id'])
    .index('by_employee', ['employeeId'])
    .index('by_employee_date', ['employeeId', 'date'])
    .index('by_date', ['date']),
  employeeAvailabilityBreaks: defineTable({
    id: v.string(),
    employeeId: v.string(),
    weekday: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    label: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index('by_availability_break_id', ['id'])
    .index('by_employee', ['employeeId'])
    .index('by_employee_weekday', ['employeeId', 'weekday'])
    .index('by_weekday', ['weekday']),
  employeeAvailabilityDateBreaks: defineTable({
    id: v.string(),
    employeeId: v.string(),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    label: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index('by_availability_date_break_id', ['id'])
    .index('by_employee', ['employeeId'])
    .index('by_employee_date', ['employeeId', 'date'])
    .index('by_date', ['date']),
  employeeAvailabilityDateBreakPolicies: defineTable({
    id: v.string(),
    employeeId: v.string(),
    date: v.string(),
    mode: v.string(),
    updatedAt: v.number(),
  })
    .index('by_availability_date_break_policy_id', ['id'])
    .index('by_employee', ['employeeId'])
    .index('by_employee_date', ['employeeId', 'date'])
    .index('by_date', ['date']),
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
