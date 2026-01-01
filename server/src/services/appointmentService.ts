import { Appointment, User } from '../models/index.js';
import { checkScheduleAvailability } from './scheduleService.js';
import type { NewAppointmentData } from './scheduleService.js';
import ApiError from '../utils/ApiError.js';
import { sequelize } from '../utils/db.js';
import type { AppointmentService, AppointmentStatus } from '../types/index.js';
import { convertDateAndTime } from '../utils/dateTime.js';

export interface UpdateAppointmentData {
  id: string;
  date?: string;
  start?: string;
  end?: string;
  service?: AppointmentService;
  status?: AppointmentStatus;
  employeeId?: string;
}

export const getAppointmentsByRole = async (user: User): Promise<Appointment[]> => {
  if (user.role === 'client') {
    return await user.getAppointments({
      attributes: {
        exclude: ['clientId', 'employeeId', 'scheduleId', 'end', 'status'],
      },
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
    });
  } else if (user.role === 'employee') {
    return await user.getEmployeeAppointments({
      attributes: {
        exclude: ['clientId', 'employeeId'],
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
      ],
    });
  }
  return [];
};

export const createNew = async (newAppt: NewAppointmentData): Promise<Appointment> => {
  const availbleScheduleId = await checkScheduleAvailability(newAppt);
  const appointment = await Appointment.create({
    date: convertDateAndTime(newAppt.date, '00:00').toDate(),
    start: convertDateAndTime(newAppt.date, newAppt.start).toDate(),
    end: convertDateAndTime(newAppt.date, newAppt.end).toDate(),
    service: newAppt.service,
    clientId: newAppt.clientId,
    employeeId: newAppt.employeeId,
    scheduleId: availbleScheduleId,
    status: 'scheduled',
  });
  return appointment;
};

export const update = async (newAppt: UpdateAppointmentData): Promise<Appointment> => {
  const appointment = await Appointment.findByPk(newAppt.id);
  if (!appointment) {
    throw new ApiError(404, 'appointment not found');
  }
  // newAppt date is a string, appointment date is a date object
  if (newAppt.date && newAppt.date !== appointment.date.toISOString().split('T')[0]) {
    // Build a NewAppointmentData object for availability check
    const checkData: NewAppointmentData = {
      date: newAppt.date,
      start: newAppt.start || appointment.start.toISOString().split('T')[1].substring(0, 5),
      end: newAppt.end || appointment.end.toISOString().split('T')[1].substring(0, 5),
      service: newAppt.service || appointment.service,
      clientId: appointment.clientId,
      employeeId: newAppt.employeeId || appointment.employeeId,
    };
    const availbleScheduleId = await checkScheduleAvailability(checkData);
    const result = await sequelize.transaction(async (_t) => {
      const schedule = await appointment.getSchedule();
      await schedule.removeAppointment(appointment);

      const updates: any = {
        scheduleId: availbleScheduleId,
        service: newAppt.service,
        status: newAppt.status,
        employeeId: newAppt.employeeId,
      };
      if (newAppt.date) updates.date = convertDateAndTime(newAppt.date, '00:00').toDate();
      if (newAppt.start) updates.start = convertDateAndTime(newAppt.date!, newAppt.start).toDate();
      if (newAppt.end) updates.end = convertDateAndTime(newAppt.date!, newAppt.end).toDate();

      appointment.set(updates);
      await appointment.save();
      return appointment;
    });
    return result;
  } else {
    const updates: any = {
      service: newAppt.service,
      status: newAppt.status,
      employeeId: newAppt.employeeId,
    };
    if (newAppt.start) updates.start = convertDateAndTime(newAppt.date || appointment.date.toISOString().split('T')[0], newAppt.start).toDate();
    if (newAppt.end) updates.end = convertDateAndTime(newAppt.date || appointment.date.toISOString().split('T')[0], newAppt.end).toDate();

    appointment.set(updates);
    await appointment.save();
    return appointment;
  }
};

export const getClientAppointmentById = async (id: string): Promise<Appointment | null> => {
  return await Appointment.findByPk(id, {
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
  });
};
