import { Appointment, Schedule, User } from '../models/index.js';
import { checkAvailabilityISO, extractDateFromISO, generateRange } from '../utils/dateTime.js';
import type { NewAppointmentData } from '../types/index.js';
import ApiError from '../utils/ApiError.js';

export const getPublicSchedules = async (): Promise<Schedule[]> => {
  return await Schedule.findAll({
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
  });
};

export const getPrivateSchedules = async (): Promise<Schedule[]> => {
  return await Schedule.findAll({
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
  });
};

export const createSchedules = async (dates: [string, string], open: string, close: string): Promise<Schedule[]> => {
  const dateRangeToSchedule = generateRange(dates, open, close);
  const newSchedules = dateRangeToSchedule.map((s) => {
    return Schedule.create({
      date: s.date.toDate(),
      open: s.open.toDate(),
      close: s.close.toDate(),
    });
  });
  return await Promise.all(newSchedules);
};

export const checkScheduleAvailability = async (newAppt: NewAppointmentData): Promise<string> => {
  const appointmentDate = extractDateFromISO(newAppt.start);

  const schedule = await Schedule.findOne({ where: { date: appointmentDate } });
  if (!schedule) {
    throw new ApiError(410, 'Schedule not available');
  }

  const appointments = await schedule.getAppointments();

  const appointmentsCheck = appointments.map(a => ({
    start: a.start.toISOString(),
    end: a.end.toISOString(),
    employeeId: a.employeeId,
  }));

  const available = checkAvailabilityISO(appointmentsCheck, newAppt);
  if (!available) {
    throw new ApiError(410, 'Appointment not available');
  }

  return schedule.id;
};
