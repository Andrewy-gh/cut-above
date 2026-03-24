import { describe, expect, it } from 'vitest';

import { api } from '../../convex/_generated/api';
import { createConvexTest } from './convexTest';

const scheduleDate = '2026-02-02';
const scheduleId = 'schedule-1';

const seedSchedule = async (t: ReturnType<typeof createConvexTest>) => {
  await t.run(async (ctx) => {
    await ctx.db.insert('schedules', {
      id: scheduleId,
      date: scheduleDate,
      open: '2026-02-02T15:00:00.000Z',
      close: '2026-02-02T21:00:00.000Z',
    });
  });
};

const seedEmployee = async (
  t: ReturnType<typeof createConvexTest>,
  input: { id: string; firstName: string }
) => {
  await t.run(async (ctx) => {
    await ctx.db.insert('users', {
      id: input.id,
      name: `${input.firstName} Employee`,
      firstName: input.firstName,
      lastName: 'Barber',
      email: `${input.id}@example.com`,
      role: 'employee',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });
};

describe('booking availability query', () => {
  it('returns employee-scoped slots from Convex', async () => {
    const t = createConvexTest();
    await seedSchedule(t);
    await seedEmployee(t, { id: 'employee-1', firstName: 'Pat' });
    await seedEmployee(t, { id: 'employee-2', firstName: 'Sam' });

    await t.run(async (ctx) => {
      await ctx.db.insert('employeeAvailabilityRules', {
        id: 'rule-1',
        employeeId: 'employee-1',
        weekday: 1,
        isWorking: true,
        startTime: '11:00',
        endTime: '14:00',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityBreaks', {
        id: 'break-1',
        employeeId: 'employee-1',
        weekday: 1,
        startTime: '12:00',
        endTime: '12:30',
        label: 'Lunch',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('appointments', {
        id: 'appointment-1',
        status: 'scheduled',
        service: 'Haircut',
        start: '2026-02-02T16:00:00.000Z',
        end: '2026-02-02T16:30:00.000Z',
        clientId: 'client-1',
        employeeId: 'employee-1',
        scheduleId,
      });
    });

    const availability = await t.query(
      api.bookingAvailability.getPublicBookingAvailability,
      {
        date: scheduleDate,
        serviceDuration: 30,
        employeeId: 'employee-1',
      }
    );

    expect(availability.schedule).toMatchObject({ id: scheduleId });
    expect(availability.slots).toEqual([
      {
        id: '2026-02-02T16:30:00.000Z',
        start: '2026-02-02T16:30:00.000Z',
        end: '2026-02-02T17:00:00.000Z',
        available: ['employee-1'],
      },
      {
        id: '2026-02-02T17:30:00.000Z',
        start: '2026-02-02T17:30:00.000Z',
        end: '2026-02-02T18:00:00.000Z',
        available: ['employee-1'],
      },
      {
        id: '2026-02-02T17:45:00.000Z',
        start: '2026-02-02T17:45:00.000Z',
        end: '2026-02-02T18:15:00.000Z',
        available: ['employee-1'],
      },
      {
        id: '2026-02-02T18:00:00.000Z',
        start: '2026-02-02T18:00:00.000Z',
        end: '2026-02-02T18:30:00.000Z',
        available: ['employee-1'],
      },
      {
        id: '2026-02-02T18:15:00.000Z',
        start: '2026-02-02T18:15:00.000Z',
        end: '2026-02-02T18:45:00.000Z',
        available: ['employee-1'],
      },
      {
        id: '2026-02-02T18:30:00.000Z',
        start: '2026-02-02T18:30:00.000Z',
        end: '2026-02-02T19:00:00.000Z',
        available: ['employee-1'],
      },
    ]);
  });

  it('excludes employees with no working window from no-preference slots', async () => {
    const t = createConvexTest();
    await seedSchedule(t);
    await seedEmployee(t, { id: 'employee-off', firstName: 'Off' });
    await seedEmployee(t, { id: 'employee-open', firstName: 'Open' });

    await t.run(async (ctx) => {
      await ctx.db.insert('employeeAvailabilityRules', {
        id: 'rule-off',
        employeeId: 'employee-off',
        weekday: 1,
        isWorking: false,
        updatedAt: Date.now(),
      });
    });

    const availability = await t.query(
      api.bookingAvailability.getPublicBookingAvailability,
      {
        date: scheduleDate,
        serviceDuration: 30,
      }
    );

    expect(availability.slots.length).toBeGreaterThan(0);
    expect(availability.slots.every((slot) => slot.available.includes('employee-open'))).toBe(
      true
    );
    expect(availability.slots.some((slot) => slot.available.includes('employee-off'))).toBe(
      false
    );
  });

  it('keeps no-preference slots bookable when another employee is still available', async () => {
    const t = createConvexTest();
    await seedSchedule(t);
    await seedEmployee(t, { id: 'employee-busy', firstName: 'Busy' });
    await seedEmployee(t, { id: 'employee-open', firstName: 'Open' });

    await t.run(async (ctx) => {
      await ctx.db.insert('appointments', {
        id: 'appointment-busy-1',
        status: 'scheduled',
        service: 'Haircut',
        start: '2026-02-02T15:00:00.000Z',
        end: '2026-02-02T15:30:00.000Z',
        clientId: 'client-1',
        employeeId: 'employee-busy',
        scheduleId,
      });
    });

    const noPreferenceAvailability = await t.query(
      api.bookingAvailability.getPublicBookingAvailability,
      {
        date: scheduleDate,
        serviceDuration: 30,
      }
    );
    const employeeSpecificAvailability = await t.query(
      api.bookingAvailability.getPublicBookingAvailability,
      {
        date: scheduleDate,
        serviceDuration: 30,
        employeeId: 'employee-busy',
      }
    );

    expect(
      noPreferenceAvailability.slots.find(
        (slot) => slot.start === '2026-02-02T15:00:00.000Z'
      )
    ).toEqual({
      id: '2026-02-02T15:00:00.000Z',
      start: '2026-02-02T15:00:00.000Z',
      end: '2026-02-02T15:30:00.000Z',
      available: ['employee-open'],
    });
    expect(
      employeeSpecificAvailability.slots.some(
        (slot) => slot.start === '2026-02-02T15:00:00.000Z'
      )
    ).toBe(false);
  });
});
