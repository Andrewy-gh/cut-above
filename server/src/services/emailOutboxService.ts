import { randomUUID } from 'crypto';
import type { Transaction } from 'sequelize';
import EmailOutbox from '../models/EmailOutbox.js';
import { formatEmail } from '../utils/formatters.js';
import type { AppointmentService } from '../types/index.js';
import type { EmailData, EmailOption } from './emailService.js';

interface EnqueueEmailOptions {
  payload: EmailData;
  eventType: string;
  dedupeKey?: string;
  availableAt?: Date;
  transaction?: Transaction;
}

interface AppointmentEmailInput {
  appointmentId: string;
  start: string;
  end: string;
  service: AppointmentService;
  employeeId: string;
  employeeFirstName: string;
  receiver: string;
  option: EmailOption;
  transaction?: Transaction;
}

const buildAppointmentDedupeKey = (appointmentId: string) =>
  `appointment:${appointmentId}:${randomUUID()}`;

export const enqueueEmail = async ({
  payload,
  eventType,
  dedupeKey,
  availableAt,
  transaction,
}: EnqueueEmailOptions) => {
  return EmailOutbox.create(
    {
      eventType,
      dedupeKey: dedupeKey ?? `${eventType}:${randomUUID()}`,
      payload,
      status: 'pending',
      attempts: 0,
      availableAt: availableAt ?? new Date(),
    },
    { transaction }
  );
};

export const enqueueAppointmentEmail = async ({
  appointmentId,
  start,
  end,
  service,
  employeeId,
  employeeFirstName,
  receiver,
  option,
  transaction,
}: AppointmentEmailInput) => {
  const payload: EmailData = {
    ...formatEmail({
      id: appointmentId,
      start,
      end,
      service,
      employee: {
        id: employeeId,
        firstName: employeeFirstName,
      },
      option,
    }),
    receiver,
  };

  return enqueueEmail({
    payload,
    eventType: `appointment.${option}`,
    dedupeKey: buildAppointmentDedupeKey(appointmentId),
    transaction,
  });
};
