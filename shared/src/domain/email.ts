export const EMAIL_OUTBOX_STATUSES = [
  "pending",
  "processing",
  "sent",
  "failed",
] as const;

export type EmailOutboxStatus = (typeof EMAIL_OUTBOX_STATUSES)[number];

export const EMAIL_DELIVERY_STATUSES = ["sending", "sent", "failed"] as const;

export type EmailDeliveryStatus = (typeof EMAIL_DELIVERY_STATUSES)[number];

export const EMAIL_EVENT_TYPES = [
  "appointment.confirmation",
  "appointment.modification",
  "appointment.cancellation",
  "contact.auto_reply",
  "contact.submission",
] as const;

export type EmailEventType = (typeof EMAIL_EVENT_TYPES)[number];
