import { v } from "convex/values";
import {
  APPOINTMENT_STATUSES,
  EMAIL_DELIVERY_STATUSES,
  EMAIL_EVENT_TYPES,
  EMAIL_OUTBOX_STATUSES,
  ROLES,
  SERVICE_NAMES,
} from "@cut-above/shared";

const literalUnion = <T extends readonly string[]>(values: T) =>
  v.union(...values.map((value) => v.literal(value)));

export const roleValidator = literalUnion(ROLES);
export const appointmentStatusValidator = literalUnion(APPOINTMENT_STATUSES);
export const serviceNameValidator = literalUnion(SERVICE_NAMES);
export const emailOutboxStatusValidator = literalUnion(EMAIL_OUTBOX_STATUSES);
export const emailDeliveryStatusValidator = literalUnion(EMAIL_DELIVERY_STATUSES);
export const emailEventTypeValidator = literalUnion(EMAIL_EVENT_TYPES);
