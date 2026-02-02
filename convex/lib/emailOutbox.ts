import type { MutationCtx } from "../_generated/server";
import { formatDateSlashISO, formatTimeISO } from "./dateTime";

type EmailOption = "confirmation" | "modification" | "cancellation";

interface EnqueueEmailOptions {
  payload: Record<string, unknown>;
  eventType: string;
  dedupeKey?: string;
  availableAt?: number;
}

interface AppointmentEmailInput {
  appointmentId: string;
  start: string;
  end: string;
  service: string;
  employeeId: string;
  employeeFirstName: string;
  receiver: string;
  option: EmailOption;
}

const buildAppointmentDedupeKey = (input: {
  eventType: string;
  appointmentId: string;
  start: string;
  end: string;
  service: string;
  employeeId: string;
  receiver: string;
}) =>
  [
    "appointment",
    input.appointmentId,
    input.eventType,
    input.start,
    input.end,
    input.service,
    input.employeeId,
    input.receiver,
  ].join("|");

const getClientUrl = () =>
  process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "";

const generateAppointmentLink = (id: string) => {
  const clientUrl = getClientUrl();
  return clientUrl ? `${clientUrl}/appointment/${id}` : `/appointment/${id}`;
};

export const enqueueEmail = async (
  ctx: MutationCtx,
  { payload, eventType, dedupeKey, availableAt }: EnqueueEmailOptions
) => {
  if (dedupeKey) {
    const existing = await ctx.db
      .query("emailOutbox")
      .withIndex("by_dedupe_key", (q) => q.eq("dedupeKey", dedupeKey))
      .first();
    if (existing) return existing.id;
  }

  const now = Date.now();
  const id = crypto.randomUUID();
  await ctx.db.insert("emailOutbox", {
    id,
    eventType,
    dedupeKey: dedupeKey ?? `${eventType}:${crypto.randomUUID()}`,
    payload,
    status: "pending",
    attempts: 0,
    availableAt: availableAt ?? now,
    createdAt: now,
    updatedAt: now,
  });
  return id;
};

export const enqueueAppointmentEmail = async (
  ctx: MutationCtx,
  input: AppointmentEmailInput
) => {
  const payload = {
    date: formatDateSlashISO(input.start),
    time: formatTimeISO(input.start),
    employee: input.employeeFirstName,
    option: input.option,
    emailLink: generateAppointmentLink(input.appointmentId),
    receiver: input.receiver,
  };

  const eventType = `appointment.${input.option}`;
  return enqueueEmail(ctx, {
    payload,
    eventType,
    dedupeKey: buildAppointmentDedupeKey({
      eventType,
      appointmentId: input.appointmentId,
      start: input.start,
      end: input.end,
      service: input.service,
      employeeId: input.employeeId,
      receiver: input.receiver,
    }),
  });
};
