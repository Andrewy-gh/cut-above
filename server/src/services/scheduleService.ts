import { Appointment, Schedule, User } from '../models/index.js';
import { checkAvailability, generateRange } from '../utils/dateTime.js';
import ApiError from '../utils/ApiError.js';
import type { AppointmentService } from '../types/index.js';

export interface NewAppointmentData {
  date: string;
  start: string;
  end: string;
  service: AppointmentService;
  clientId: string;
  employeeId: string;
}

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

export const createSchedules = async (dates: string[], open: string, close: string): Promise<Schedule[]> => {
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
  const schedule = await Schedule.findOne({ where: { date: newAppt.date } });
  if (!schedule) {
    throw new ApiError(410, 'Schedule not available');
  }
  // TODO: Eager load appointments
  const appointments = await schedule.getAppointments();
  // Convert appointments to the format expected by checkAvailability
  const appointmentsCheck = appointments.map(a => ({
    date: a.date.toISOString().split('T')[0],
    start: a.start.toISOString().split('T')[1].substring(0, 5),
    end: a.end.toISOString().split('T')[1].substring(0, 5),
    employeeId: a.employeeId,
  }));
  // TODO: check before open or check after close too
  const available = checkAvailability(appointmentsCheck, newAppt);
  if (!available) {
    throw new ApiError(410, 'Appointment not available'); // Gone
  }
  return schedule.id;
};
