import { Appointment, Schedule, User } from '../models/index.js';
import { checkAvailabilityISO, generateRange } from '../utils/dateTime.js';
import type { NewAppointmentData } from '../types/index.js';
import { sequelize } from '../utils/db.js';
import type { Transaction } from 'sequelize';
import { Result } from 'better-result';
import { ValidationError } from '../errors.js';
import { tryDb } from '../utils/dbResult.js';

export const getPublicSchedules = async () =>
  tryDb({
    try: () =>
      Schedule.findAll({
        include: [
          {
            model: Appointment,
            as: 'appointments',
            attributes: {
              exclude: ['clientId', 'scheduleId', 'employeeId'],
            },
            include: [
              {
                model: User.scope('withoutPassword'),
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
          },
        ],
      }),
    message: 'Failed to fetch schedules',
  });

export const getPrivateSchedules = async () =>
  tryDb({
    try: () =>
      Schedule.findAll({
        include: [
          {
            model: Appointment,
            as: 'appointments',
            attributes: {
              exclude: ['scheduleId', 'clientId', 'employeeId'],
            },
            include: [
              {
                model: User.scope('withoutPassword'),
                as: 'client',
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
              {
                model: User.scope('withoutPassword'),
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
          },
        ],
      }),
    message: 'Failed to fetch schedules',
  });

export const createSchedules = async (
  dates: [string, string],
  open: string,
  close: string,
) =>
  tryDb({
    try: async () => {
      const dateRangeToSchedule = generateRange(dates, open, close);
      const newSchedules = dateRangeToSchedule.map((s) => {
        return Schedule.create({
          open: s.open.toDate(),
          close: s.close.toDate(),
        });
      });
      return Promise.all(newSchedules);
    },
    message: 'Failed to create schedules',
  });

export const checkScheduleAvailability = async (
  newAppt: NewAppointmentData,
  transaction?: Transaction
) =>
  Result.gen(async function* () {
    const appointmentStart = new Date(newAppt.start);

    const schedule = yield* Result.await(
      tryDb({
        try: () =>
          Schedule.findOne({
            where: sequelize.where(
              sequelize.fn('DATE', sequelize.col('open')),
              sequelize.fn('DATE', appointmentStart),
            ),
            transaction,
          }),
        message: 'Failed to fetch schedule',
      }),
    );

    if (!schedule) {
      return Result.err(
        new ValidationError({
          statusCode: 410,
          message: 'No schedule found for selected date',
        }),
      );
    }

    const appointments = yield* Result.await(
      tryDb({
        try: () => schedule.getAppointments({ transaction }),
        message: 'Failed to fetch appointments',
      }),
    );

    const appointmentsCheck = appointments.map((a) => ({
      start: a.start.toISOString(),
      end: a.end.toISOString(),
      employeeId: a.employeeId,
    }));

    const available = checkAvailabilityISO(appointmentsCheck, newAppt);
    if (!available) {
      return Result.err(
        new ValidationError({
          statusCode: 409,
          message: 'Time slot conflicts with existing appointment',
        }),
      );
    }

    return Result.ok(String(schedule.id));
  });
