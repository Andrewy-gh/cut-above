import { randomUUID } from 'crypto';
import type { Transaction } from 'sequelize';
import { Result } from 'better-result';
import EmailOutbox from '../models/EmailOutbox.js';
import { formatEmail } from '../utils/formatters.js';
import type { AppointmentService } from '../types/index.js';
import type { EmailData, EmailOption } from './emailService.js';
import { DatabaseError } from '../errors.js';

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

const buildAppointmentDedupeKey = (input: {
  eventType: string;
  appointmentId: string;
  start: string;
  end: string;
  service: AppointmentService;
  employeeId: string;
  receiver: string;
}) =>
  [
    'appointment',
    input.appointmentId,
    input.eventType,
    input.start,
    input.end,
    input.service,
    input.employeeId,
    input.receiver,
  ].join('|');

export const enqueueEmail = async ({
  payload,
  eventType,
  dedupeKey,
  availableAt,
  transaction,
}: EnqueueEmailOptions) => {
  if (dedupeKey) {
    return Result.tryPromise({
      try: async () => {
        const [record] = await EmailOutbox.findOrCreate({
          where: { dedupeKey },
          defaults: {
            eventType,
            dedupeKey,
            payload,
            status: 'pending',
            attempts: 0,
            availableAt: availableAt ?? new Date(),
          },
          transaction,
        });
        return record;
      },
      catch: (cause) =>
        new DatabaseError({
          statusCode: 500,
          message:
            cause instanceof Error
              ? cause.message
              : 'Failed to enqueue email',
          cause,
        }),
    });
  }

  return Result.tryPromise({
    try: () =>
      EmailOutbox.create(
        {
          eventType,
          dedupeKey: `${eventType}:${randomUUID()}`,
          payload,
          status: 'pending',
          attempts: 0,
          availableAt: availableAt ?? new Date(),
        },
        { transaction },
      ),
    catch: (cause) =>
      new DatabaseError({
        statusCode: 500,
        message:
          cause instanceof Error
            ? cause.message
            : 'Failed to enqueue email',
        cause,
      }),
  });
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

  const eventType = `appointment.${option}`;
  return enqueueEmail({
    payload,
    eventType,
    dedupeKey: buildAppointmentDedupeKey({
      eventType,
      appointmentId,
      start,
      end,
      service,
      employeeId,
      receiver,
    }),
    transaction,
  });
};
