import { Appointment, User } from '../models/index.js';
import { Result } from 'better-result';
import { checkScheduleAvailability } from './scheduleService.js';
import ApiError from '../utils/ApiError.js';
import { DatabaseError } from '../errors.js';
import { sequelize } from '../utils/db.js';
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

export const createNew = async (newAppt: NewAppointmentData) =>
  Result.tryPromise({
    try: async () => {
      const availbleScheduleId = await checkScheduleAvailability(newAppt);
      const appointment = await Appointment.create({
        start: convertISOToDate(newAppt.start),
        end: convertISOToDate(newAppt.end),
        service: newAppt.service,
        clientId: newAppt.clientId,
        employeeId: newAppt.employeeId,
        scheduleId: availbleScheduleId,
        status: 'scheduled',
      });
      return appointment;
    },
    catch: () =>
      new DatabaseError({
        statusCode: 500,
        message: 'Failed to create appointment',
      }),
  });

export const update = async (newAppt: UpdateAppointmentData) =>
  Result.tryPromise({
    try: async () => {
      const appointment = await Appointment.findByPk(newAppt.id);
      if (!appointment) {
        throw new ApiError(404, 'appointment not found');
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

          const availbleScheduleId = await checkScheduleAvailability(checkData);

          const result = await sequelize.transaction(async (t) => {
            const schedule = await appointment.getSchedule({ transaction: t });
            if (schedule) {
              await schedule.removeAppointment(appointment, { transaction: t });
            }

            const updates: Partial<AppointmentAttributes> = { scheduleId: availbleScheduleId };
            if (newAppt.service) updates.service = newAppt.service;
            if (newAppt.status) updates.status = newAppt.status;
            if (newAppt.employeeId) updates.employeeId = newAppt.employeeId;
            if (newAppt.start) updates.start = convertISOToDate(newAppt.start);
            if (newAppt.end) updates.end = convertISOToDate(newAppt.end);

            appointment.set(updates);
            await appointment.save({ transaction: t });
            return appointment;
          });
          return result;
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
      await appointment.save();
      return appointment;
    },
    catch: (cause) => {
      if (cause instanceof ApiError) {
        return new DatabaseError({
          statusCode: cause.statusCode,
          message: cause.message,
        });
      }
      return new DatabaseError({
        statusCode: 500,
        message: 'Failed to update appointment',
      });
    },
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
