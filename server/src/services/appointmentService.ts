import { Appointment, User } from '../models/index.js';
import { Result } from 'better-result';
import { checkScheduleAvailability } from './scheduleService.js';
import { DatabaseError, NotFoundError } from '../errors.js';
import { sequelize } from '../utils/db.js';
import type { Transaction } from 'sequelize';
import type { NewAppointmentData, UpdateAppointmentData } from '../types/index.js';
import type { AppointmentAttributes } from '../types/models.js';
import { convertISOToDate, extractDateFromISO } from '../utils/dateTime.js';
import dayjs from 'dayjs';

const USER_PUBLIC_EXCLUDE: string[] = [
  'passwordHash',
  'image',
  'profile',
  'lastName',
  'role',
  'email',
];

const CLIENT_APPOINTMENT_EXCLUDE: string[] = [
  'clientId',
  'employeeId',
  'scheduleId',
  'end',
  'status',
];

const EMPLOYEE_APPOINTMENT_EXCLUDE: string[] = ['clientId', 'employeeId'];

const getClientAppointments = async (user: User) =>
  user.getAppointments({
    attributes: {
      exclude: CLIENT_APPOINTMENT_EXCLUDE,
    },
    include: [
      {
        model: User.scope('withoutPassword'),
        as: 'employee',
        attributes: {
          exclude: USER_PUBLIC_EXCLUDE,
        },
      },
    ],
  });

const getEmployeeAppointments = async (user: User) =>
  user.getEmployeeAppointments({
    attributes: {
      exclude: EMPLOYEE_APPOINTMENT_EXCLUDE,
    },
    include: [
      {
        model: User.scope('withoutPassword'),
        as: 'client',
        attributes: {
          exclude: USER_PUBLIC_EXCLUDE,
        },
      },
    ],
  });

export const getAppointmentsByRole = async (user: User) =>
  Result.tryPromise({
    try: async () => {
      switch (user.role) {
        case 'client':
          return getClientAppointments(user);
        case 'employee':
          return getEmployeeAppointments(user);
        default:
          return [];
      }
    },
    catch: () =>
      new DatabaseError({
        statusCode: 500,
        message: 'Failed to fetch appointments',
      }),
  });

export const createNew = async (
  newAppt: NewAppointmentData,
  options: { transaction?: Transaction } = {},
) =>
  Result.gen(async function* () {
    const availbleScheduleId = yield* Result.await(
      checkScheduleAvailability(newAppt, options.transaction),
    );
    const appointment = yield* Result.await(
      Result.tryPromise({
        try: () =>
          Appointment.create(
            {
              start: convertISOToDate(newAppt.start),
              end: convertISOToDate(newAppt.end),
              service: newAppt.service,
              clientId: newAppt.clientId,
              employeeId: newAppt.employeeId,
              scheduleId: availbleScheduleId,
              status: 'scheduled',
            },
            { transaction: options.transaction },
          ),
        catch: () =>
          new DatabaseError({
            statusCode: 500,
            message: 'Failed to create appointment',
          }),
      }),
    );
    return Result.ok(appointment);
  });

export const update = async (
  newAppt: UpdateAppointmentData,
  options: { transaction?: Transaction } = {},
) =>
  Result.gen(async function* () {
    const appointment = yield* Result.await(
      Result.tryPromise({
        try: () =>
          Appointment.findByPk(newAppt.id, {
            transaction: options.transaction,
          }),
        catch: () =>
          new DatabaseError({
            statusCode: 500,
            message: 'Failed to update appointment',
          }),
      }),
    );
    if (!appointment) {
      return Result.err(
        new NotFoundError({
          statusCode: 404,
          message: 'appointment not found',
        }),
      );
    }

    // Check if date changed (extract from start ISO)
    if (newAppt.start) {
      const newDate = extractDateFromISO(newAppt.start);
      const currentDate = dayjs(appointment.start).format('YYYY-MM-DD');

      if (newDate !== currentDate) {
        // Build a NewAppointmentData object for availability check
        const checkData: NewAppointmentData = {
          start: newAppt.start,
          end: newAppt.end || appointment.end.toISOString(),
          service: newAppt.service || appointment.service,
          clientId: appointment.clientId,
          employeeId: newAppt.employeeId || appointment.employeeId,
        };

        const availbleScheduleId = yield* Result.await(
          checkScheduleAvailability(checkData, options.transaction),
        );

        const applyScheduleChange = async (transaction: Transaction) => {
          const schedule = await appointment.getSchedule({
            transaction,
          });
          if (schedule) {
            await schedule.removeAppointment(appointment, {
              transaction,
            });
          }

          const updates: Partial<AppointmentAttributes> = {
            scheduleId: availbleScheduleId,
          };
          if (newAppt.service) updates.service = newAppt.service;
          if (newAppt.status) updates.status = newAppt.status;
          if (newAppt.employeeId) updates.employeeId = newAppt.employeeId;
          if (newAppt.start) updates.start = convertISOToDate(newAppt.start);
          if (newAppt.end) updates.end = convertISOToDate(newAppt.end);

          appointment.set(updates);
          await appointment.save({ transaction });
          return appointment;
        };

        if (options.transaction) {
          const transaction = options.transaction;
          const updated = yield* Result.await(
            Result.tryPromise({
              try: () => applyScheduleChange(transaction),
              catch: () =>
                new DatabaseError({
                  statusCode: 500,
                  message: 'Failed to update appointment',
                }),
            }),
          );
          return Result.ok(updated);
        }

        const updated = yield* Result.await(
          Result.tryPromise({
            try: () =>
              sequelize.transaction(async (transaction) =>
                applyScheduleChange(transaction),
              ),
            catch: () =>
              new DatabaseError({
                statusCode: 500,
                message: 'Failed to update appointment',
              }),
          }),
        );
        return Result.ok(updated);
      }
    }

    // Simple update without schedule change
    const updates: Partial<AppointmentAttributes> = {};
    if (newAppt.service) updates.service = newAppt.service;
    if (newAppt.status) updates.status = newAppt.status;
    if (newAppt.employeeId) updates.employeeId = newAppt.employeeId;
    if (newAppt.start) updates.start = convertISOToDate(newAppt.start);
    if (newAppt.end) updates.end = convertISOToDate(newAppt.end);

    appointment.set(updates);
    const updated = yield* Result.await(
      Result.tryPromise({
        try: () => appointment.save({ transaction: options.transaction }),
        catch: () =>
          new DatabaseError({
            statusCode: 500,
            message: 'Failed to update appointment',
          }),
      }),
    );
    return Result.ok(updated);
  });

export const getClientAppointmentById = async (id: string) =>
  Result.tryPromise({
    try: () =>
      Appointment.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            attributes: {
              exclude: [
                'passwordHash',
                'image',
                'profile',
                'lastName',
                'role',
                'email',
              ],
            },
          },
        ],
      }),
    catch: () =>
      new DatabaseError({
        statusCode: 500,
        message: 'Failed to fetch appointment',
      }),
  });
