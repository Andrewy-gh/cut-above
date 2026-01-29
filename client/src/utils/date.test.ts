import { describe, expect, it } from 'vitest';

import {
  formatDate,
  formatDateSlash,
  formatDateToTime,
  normalizeAppointment,
  normalizeAppointments,
  normalizeSchedule,
  normalizeSchedules,
} from './date';

type AppointmentInput = {
  id: string;
  start: string;
  service: string;
  status: string;
  date?: string;
};

describe('date normalization helpers', () => {
  it('normalizes an appointment with ISO start into date and display time', () => {
    const start = '2024-01-22T17:00:00.000Z';
    const appointment: AppointmentInput = {
      id: 'appt-1',
      start,
      service: 'Haircut',
      status: 'scheduled',
    };

    const normalized = normalizeAppointment(appointment);

    expect(normalized.date).toBe(formatDateSlash(start));
    expect(normalized.start).toBe(formatDateToTime(start));
    expect(normalized.id).toBe('appt-1');
  });

  it('keeps an appointment date when already provided', () => {
    const appointment = {
      id: 'appt-2',
      start: '10:00am',
      date: '01/22/2024',
      service: 'Beard Trim',
      status: 'scheduled',
    };

    const normalized = normalizeAppointment(appointment);

    expect(normalized.date).toBe('01/22/2024');
    expect(normalized.start).toBe('10:00am');
  });

  it('normalizes schedules with derived date', () => {
    const open = '2024-01-22T14:00:00.000Z';
    const schedule = {
      id: 'sched-1',
      open,
      close: '2024-01-22T22:00:00.000Z',
      appointments: [],
    };

    const normalized = normalizeSchedule(schedule);

    expect(normalized.date).toBe(formatDate(open));
    expect(normalized.id).toBe('sched-1');
  });

  it('normalizes appointment and schedule collections', () => {
    const start = '2024-01-23T17:00:00.000Z';
    const appointments = normalizeAppointments([
      {
        id: 'appt-3',
        start,
        service: 'Haircut',
        status: 'scheduled',
      },
    ] as AppointmentInput[]);

    expect(appointments).toHaveLength(1);
    expect(appointments[0].date).toBe(formatDateSlash(start));

    const open = '2024-01-24T14:00:00.000Z';
    const schedules = normalizeSchedules([
      {
        id: 'sched-2',
        open,
        close: '2024-01-24T22:00:00.000Z',
        appointments: [],
      },
    ]);

    expect(schedules).toHaveLength(1);
    expect(schedules[0].date).toBe(formatDate(open));
  });
});
