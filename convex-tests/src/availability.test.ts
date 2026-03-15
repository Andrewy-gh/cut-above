import { describe, expect, it } from 'vitest';

import { api, components } from '../../convex/_generated/api';
import { createConvexTest } from './convexTest';

const scheduleDate = '2026-02-02';
const scheduleId = 'schedule-1';

const createAuthUser = async (
  t: ReturnType<typeof createConvexTest>,
  role: 'admin' | 'client' | 'employee'
) => {
  const now = Date.now();
  const name = `${role[0].toUpperCase()}${role.slice(1)} User`;
  const email = `${role}@example.com`;

  const authUser = await t.mutation(components.betterAuth.adapter.create, {
    input: {
      model: 'user',
      data: {
        name,
        email,
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
      },
    },
  });

  const authUserId =
    (authUser as { id?: string; _id?: string }).id ??
    (authUser as { _id?: string })._id;
  if (!authUserId) {
    throw new Error('Auth user id missing from better-auth adapter response.');
  }

  const session = await t.mutation(components.betterAuth.adapter.create, {
    input: {
      model: 'session',
      data: {
        userId: authUserId,
        token: `session-${authUserId}`,
        createdAt: now,
        updatedAt: now,
        expiresAt: now + 60 * 60 * 1000,
      },
    },
  });

  const sessionId =
    (session as { id?: string; _id?: string }).id ??
    (session as { _id?: string })._id;
  if (!sessionId) {
    throw new Error('Session id missing from better-auth adapter response.');
  }

  await t.run(async (ctx) => {
    await ctx.db.insert('users', {
      id: authUserId,
      name,
      firstName: role === 'employee' ? 'Pat' : role === 'admin' ? 'Alex' : 'Casey',
      lastName: 'User',
      email,
      role,
      createdAt: now,
      updatedAt: now,
    });
  });

  return {
    id: authUserId,
    identity: {
      subject: authUserId,
      sessionId,
      name,
      email,
    },
  };
};

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

describe('employee availability', () => {
  it('allows employees to save and query weekly availability', async () => {
    const t = createConvexTest();
    const employee = await createAuthUser(t, 'employee');

    const asEmployee = t.withIdentity(employee.identity);
    await asEmployee.mutation(api.availability.saveWeeklyAvailability, {
      weekly: [
        { weekday: 0, isWorking: false },
        { weekday: 1, isWorking: true, startTime: '11:00', endTime: '15:00' },
        { weekday: 2, isWorking: true, startTime: '09:00', endTime: '17:00' },
        { weekday: 3, isWorking: true, startTime: '09:00', endTime: '17:00' },
        { weekday: 4, isWorking: true, startTime: '09:00', endTime: '17:00' },
        { weekday: 5, isWorking: true, startTime: '09:00', endTime: '17:00' },
        { weekday: 6, isWorking: false },
      ],
    });
    await asEmployee.mutation(api.availability.upsertAvailabilityBreak, {
      break: {
        weekday: 1,
        startTime: '12:00',
        endTime: '12:30',
        label: 'Lunch',
      },
    });
    await asEmployee.mutation(api.availability.upsertAvailabilityDateBreak, {
      dateBreak: {
        date: '2026-02-03',
        startTime: '14:00',
        endTime: '14:30',
        label: 'Dentist',
      },
      mode: 'replace',
    });

    const availability = await asEmployee.query(api.availability.getAvailability, {});

    expect(availability.weekly).toEqual(
      expect.arrayContaining([
        {
          weekday: 1,
          isWorking: true,
          startTime: '11:00',
          endTime: '15:00',
        },
        {
          weekday: 6,
          isWorking: false,
          startTime: undefined,
          endTime: undefined,
        },
      ])
    );
    expect(availability.breaks).toEqual([
      {
        id: expect.any(String),
        weekday: 1,
        startTime: '12:00',
        endTime: '12:30',
        label: 'Lunch',
      },
    ]);
    expect(availability.dateBreaks).toEqual([
      {
        id: expect.any(String),
        date: '2026-02-03',
        startTime: '14:00',
        endTime: '14:30',
        label: 'Dentist',
      },
    ]);
    expect(availability.dateBreakPolicies).toEqual([
      {
        date: '2026-02-03',
        mode: 'replace',
      },
    ]);
  });

  it('returns employee availability windows on public schedules', async () => {
    const t = createConvexTest();
    const employee = await createAuthUser(t, 'employee');
    await seedSchedule(t);

    await t.run(async (ctx) => {
      await ctx.db.insert('employeeAvailabilityRules', {
        id: 'rule-1',
        employeeId: employee.id,
        weekday: 1,
        isWorking: true,
        startTime: '11:00',
        endTime: '14:00',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityBreaks', {
        id: 'break-1',
        employeeId: employee.id,
        weekday: 1,
        startTime: '12:00',
        endTime: '12:30',
        label: 'Lunch',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityDateBreaks', {
        id: 'date-break-1',
        employeeId: employee.id,
        date: scheduleDate,
        startTime: '13:30',
        endTime: '14:00',
        label: 'Supply run',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityDateBreakPolicies', {
        id: 'date-break-policy-1',
        employeeId: employee.id,
        date: scheduleDate,
        mode: 'replace',
        updatedAt: Date.now(),
      });
    });

    const schedule = await t.query(api.schedules.getPublicScheduleByDate, {
      date: scheduleDate,
    });

    expect(schedule?.employeeAvailability).toEqual([
      {
        employeeId: employee.id,
        start: '2026-02-02T16:00:00.000Z',
        end: '2026-02-02T19:00:00.000Z',
      },
    ]);
    expect(schedule?.employeeBreaks).toEqual([
      {
        id: 'date-break-1',
        employeeId: employee.id,
        start: '2026-02-02T18:30:00.000Z',
        end: '2026-02-02T19:00:00.000Z',
        label: 'Supply run',
      },
    ]);
  });

  it('still allows booking when no availability rules exist', async () => {
    const t = createConvexTest();
    const employee = await createAuthUser(t, 'employee');
    const client = await createAuthUser(t, 'client');
    await seedSchedule(t);

    const asClient = t.withIdentity(client.identity);
    await expect(
      asClient.mutation(api.appointments.createAppointment, {
        start: '2026-02-02T16:00:00.000Z',
        end: '2026-02-02T16:30:00.000Z',
        service: 'Haircut',
        employee: { id: employee.id, firstName: 'Pat' },
      })
    ).resolves.toMatchObject({
      success: true,
    });
  });

  it('rejects bookings outside an explicit availability window', async () => {
    const t = createConvexTest();
    const employee = await createAuthUser(t, 'employee');
    const client = await createAuthUser(t, 'client');
    await seedSchedule(t);

    await t.run(async (ctx) => {
      await ctx.db.insert('employeeAvailabilityRules', {
        id: 'rule-outside-window-1',
        employeeId: employee.id,
        weekday: 1,
        isWorking: true,
        startTime: '11:00',
        endTime: '14:00',
        updatedAt: Date.now(),
      });
    });

    const asClient = t.withIdentity(client.identity);
    await expect(
      asClient.mutation(api.appointments.createAppointment, {
        start: '2026-02-02T20:00:00.000Z',
        end: '2026-02-02T20:30:00.000Z',
        service: 'Haircut',
        employee: { id: employee.id, firstName: 'Pat' },
      })
    ).rejects.toThrow(/Employee is unavailable for selected time/);
  });

  it('rejects bookings that overlap a date-specific break', async () => {
    const t = createConvexTest();
    const employee = await createAuthUser(t, 'employee');
    const client = await createAuthUser(t, 'client');
    await seedSchedule(t);

    await t.run(async (ctx) => {
      await ctx.db.insert('employeeAvailabilityRules', {
        id: 'rule-2',
        employeeId: employee.id,
        weekday: 1,
        isWorking: true,
        startTime: '11:00',
        endTime: '15:00',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityBreaks', {
        id: 'break-2',
        employeeId: employee.id,
        weekday: 1,
        startTime: '12:00',
        endTime: '12:30',
        label: 'Lunch',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityDateBreaks', {
        id: 'date-break-2',
        employeeId: employee.id,
        date: scheduleDate,
        startTime: '14:00',
        endTime: '14:30',
        label: 'Errand',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityDateBreakPolicies', {
        id: 'date-break-policy-2',
        employeeId: employee.id,
        date: scheduleDate,
        mode: 'replace',
        updatedAt: Date.now(),
      });
    });

    const asClient = t.withIdentity(client.identity);
    await expect(
      asClient.mutation(api.appointments.createAppointment, {
        start: '2026-02-02T19:00:00.000Z',
        end: '2026-02-02T19:30:00.000Z',
        service: 'Haircut',
        employee: { id: employee.id, firstName: 'Pat' },
      })
    ).rejects.toThrow(/Employee is unavailable for selected time/);
  });

  it('allows bookings during recurring break when date policy replaces it', async () => {
    const t = createConvexTest();
    const employee = await createAuthUser(t, 'employee');
    const client = await createAuthUser(t, 'client');
    await seedSchedule(t);

    await t.run(async (ctx) => {
      await ctx.db.insert('employeeAvailabilityRules', {
        id: 'rule-3',
        employeeId: employee.id,
        weekday: 1,
        isWorking: true,
        startTime: '11:00',
        endTime: '15:00',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityBreaks', {
        id: 'break-allow-1',
        employeeId: employee.id,
        weekday: 1,
        startTime: '12:00',
        endTime: '12:30',
        label: 'Lunch',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityDateBreaks', {
        id: 'date-break-allow-1',
        employeeId: employee.id,
        date: scheduleDate,
        startTime: '14:00',
        endTime: '14:30',
        label: 'Errand',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityDateBreakPolicies', {
        id: 'date-break-policy-allow-1',
        employeeId: employee.id,
        date: scheduleDate,
        mode: 'replace',
        updatedAt: Date.now(),
      });
    });

    const asClient = t.withIdentity(client.identity);
    await expect(
      asClient.mutation(api.appointments.createAppointment, {
        start: '2026-02-02T17:00:00.000Z',
        end: '2026-02-02T17:30:00.000Z',
        service: 'Haircut',
        employee: { id: employee.id, firstName: 'Pat' },
      })
    ).resolves.toMatchObject({
      success: true,
    });
  });

  it('returns an admin date summary with breaks and appointment counts', async () => {
    const t = createConvexTest();
    const employee = await createAuthUser(t, 'employee');
    const admin = await createAuthUser(t, 'admin');
    await seedSchedule(t);

    await t.run(async (ctx) => {
      await ctx.db.insert('employeeAvailabilityBreaks', {
        id: 'break-3',
        employeeId: employee.id,
        weekday: 1,
        startTime: '12:00',
        endTime: '12:30',
        label: 'Lunch',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityDateBreaks', {
        id: 'date-break-3',
        employeeId: employee.id,
        date: scheduleDate,
        startTime: '14:00',
        endTime: '14:30',
        label: 'School pickup',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('employeeAvailabilityDateBreakPolicies', {
        id: 'date-break-policy-3',
        employeeId: employee.id,
        date: scheduleDate,
        mode: 'replace',
        updatedAt: Date.now(),
      });
      await ctx.db.insert('appointments', {
        id: 'appointment-1',
        status: 'scheduled',
        service: 'Haircut',
        start: '2026-02-02T16:00:00.000Z',
        end: '2026-02-02T16:30:00.000Z',
        clientId: 'client-1',
        employeeId: employee.id,
        scheduleId,
      });
    });

    const asAdmin = t.withIdentity(admin.identity);
    const summary = await asAdmin.query(api.availability.getAvailabilitySummaryByDate, {
      date: scheduleDate,
    });

    expect(summary.schedule).toMatchObject({
      id: scheduleId,
    });
    expect(summary.employees).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: employee.id,
          appointmentCount: 1,
          breakMode: 'replace',
          breaks: [
            expect.objectContaining({
              id: 'date-break-3',
              label: 'School pickup',
            }),
          ],
        }),
      ])
    );
  });

  it('returns a range summary for calendar view', async () => {
    const t = createConvexTest();
    const employee = await createAuthUser(t, 'employee');
    const admin = await createAuthUser(t, 'admin');
    await seedSchedule(t);

    await t.run(async (ctx) => {
      await ctx.db.insert('employeeAvailabilityDateBreaks', {
        id: 'date-break-range-1',
        employeeId: employee.id,
        date: scheduleDate,
        startTime: '14:00',
        endTime: '14:30',
        label: 'Errand',
        updatedAt: Date.now(),
      });
    });

    const asAdmin = t.withIdentity(admin.identity);
    const summary = await asAdmin.query(api.availability.getAvailabilitySummaryRange, {
      startDate: scheduleDate,
      days: 2,
    });

    expect(summary.startDate).toBe(scheduleDate);
    expect(summary.days).toHaveLength(2);
    expect(summary.days[0]).toMatchObject({
      date: scheduleDate,
      schedule: { id: scheduleId },
    });
    expect(summary.days[1]).toMatchObject({
      date: '2026-02-03',
      schedule: null,
    });
  });
});
