import { Appointment, User } from '../models/index.js';
import { checkScheduleAvailability } from './scheduleService.js';
import ApiError from '../utils/ApiError.js';
import { sequelize } from '../utils/db.js';
import type { NewAppointmentData, UpdateAppointmentData } from '../types/index.js';
import type { AppointmentAttributes } from '../types/models.js';
import { convertISOToDate, extractDateFromISO } from '../utils/dateTime.js';
import dayjs from 'dayjs';

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
    date: convertISOToDate(newAppt.start),
    start: convertISOToDate(newAppt.start),
    end: convertISOToDate(newAppt.end),
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

  // Check if date changed (extract from start ISO)
  if (newAppt.start) {
    const newDate = extractDateFromISO(newAppt.start);
    const currentDate = dayjs(appointment.date).format('YYYY-MM-DD');

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

      return await sequelize.transaction(async (t) => {
        const schedule = await appointment.getSchedule({ transaction: t });
        if (schedule) {
          await schedule.removeAppointment(appointment, { transaction: t });
        }

        const updates: Partial<AppointmentAttributes> = { scheduleId: availbleScheduleId };
        if (newAppt.service) updates.service = newAppt.service;
        if (newAppt.status) updates.status = newAppt.status;
        if (newAppt.employeeId) updates.employeeId = newAppt.employeeId;
        if (newAppt.start) {
          updates.date = convertISOToDate(newAppt.start);
          updates.start = convertISOToDate(newAppt.start);
        }
        if (newAppt.end) updates.end = convertISOToDate(newAppt.end);

        appointment.set(updates);
        await appointment.save({ transaction: t });
        return appointment;
      });
    }
  }

  // Simple update without schedule change
  const updates: Partial<AppointmentAttributes> = {};
  if (newAppt.service) updates.service = newAppt.service;
  if (newAppt.status) updates.status = newAppt.status;
  if (newAppt.employeeId) updates.employeeId = newAppt.employeeId;
  if (newAppt.start) {
    updates.date = convertISOToDate(newAppt.start);
    updates.start = convertISOToDate(newAppt.start);
  }
  if (newAppt.end) updates.end = convertISOToDate(newAppt.end);

  appointment.set(updates);
  await appointment.save();
  return appointment;
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
