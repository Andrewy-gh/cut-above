import { describe, expect, it } from 'vitest';

import { api, components } from '../../convex/_generated/api';
import { createConvexTest } from './convexTest';

const scheduleDate = '2026-02-02';
const scheduleId = 'schedule-1';
const otherScheduleId = 'schedule-2';
const employeeId = 'employee-1';
const clientId = 'client-1';
const futureScheduleDate = '2099-02-03';

const createAuthUser = async (
  t: ReturnType<typeof createConvexTest>,
  role: 'admin' | 'client'
) => {
  const now = Date.now();
  const name = role === 'admin' ? 'Admin User' : 'Client User';
  const email = role === 'admin' ? 'admin@example.com' : 'client@example.com';

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

const seedSchedules = async (t: ReturnType<typeof createConvexTest>) => {
  await t.run(async (ctx) => {
    await ctx.db.insert('schedules', {
      id: scheduleId,
      date: scheduleDate,
      open: '2026-02-02T15:00:00.000Z',
      close: '2026-02-02T21:00:00.000Z',
    });
    await ctx.db.insert('schedules', {
      id: otherScheduleId,
      date: futureScheduleDate,
      open: '2099-02-03T15:00:00.000Z',
      close: '2099-02-03T21:00:00.000Z',
    });
  });
};

const seedUsersAndAppointment = async (t: ReturnType<typeof createConvexTest>) => {
  const now = Date.now();

  await t.run(async (ctx) => {
    await ctx.db.insert('users', {
      id: employeeId,
      name: 'Employee User',
      firstName: 'Pat',
      lastName: 'Barber',
      email: 'employee@example.com',
      role: 'employee',
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('users', {
      id: clientId,
      name: 'Client User',
      firstName: 'Casey',
      lastName: 'Client',
      email: 'booker@example.com',
      role: 'client',
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('appointments', {
      id: 'appointment-1',
      status: 'scheduled',
      service: 'Haircut',
      start: '2026-02-02T16:00:00.000Z',
      end: '2026-02-02T16:30:00.000Z',
      clientId,
      employeeId,
      scheduleId,
    });
  });
};

describe('schedules queries', () => {
  it('returns only the requested public schedule date', async () => {
    const t = createConvexTest();
    await seedSchedules(t);
    await seedUsersAndAppointment(t);

    const schedule = await t.query(api.schedules.getPublicScheduleByDate, {
      date: scheduleDate,
    });

    expect(schedule?.id).toBe(scheduleId);
    expect(schedule?.appointments).toHaveLength(1);
    expect(schedule?.appointments[0]).toMatchObject({
      id: 'appointment-1',
      employee: {
        id: employeeId,
        firstName: 'Pat',
        lastName: 'Barber',
      },
    });
    expect(schedule?.appointments[0]).not.toHaveProperty('client');
  });

  it('returns a private schedule by id for admins with client details', async () => {
    const t = createConvexTest();
    await seedSchedules(t);
    await seedUsersAndAppointment(t);
    const admin = await createAuthUser(t, 'admin');

    const asAdmin = t.withIdentity(admin.identity);
    const schedule = await asAdmin.query(api.schedules.getPrivateScheduleById, {
      id: scheduleId,
    });

    expect(schedule?.id).toBe(scheduleId);
    expect(schedule?.appointments[0]).toMatchObject({
      id: 'appointment-1',
      employee: {
        id: employeeId,
        firstName: 'Pat',
        lastName: 'Barber',
      },
      client: {
        id: clientId,
        firstName: 'Casey',
        lastName: 'Client',
      },
    });
  });

  it('keeps cancelled appointments in private schedules but excludes them from public booking data', async () => {
    const t = createConvexTest();
    await seedSchedules(t);
    await seedUsersAndAppointment(t);
    const admin = await createAuthUser(t, 'admin');

    await t.run(async (ctx) => {
      await ctx.db.insert('appointments', {
        id: 'appointment-cancelled',
        status: 'cancelled',
        service: 'Haircut',
        start: '2026-02-02T17:00:00.000Z',
        end: '2026-02-02T17:30:00.000Z',
        clientId,
        employeeId,
        scheduleId,
      });
    });

    const publicSchedule = await t.query(api.schedules.getPublicScheduleByDate, {
      date: scheduleDate,
    });

    expect(publicSchedule?.appointments.map((appointment) => appointment.id)).toEqual([
      'appointment-1',
    ]);

    const asAdmin = t.withIdentity(admin.identity);
    const privateSchedule = await asAdmin.query(api.schedules.getPrivateScheduleById, {
      id: scheduleId,
    });

    expect(privateSchedule?.appointments.map((appointment) => appointment.id)).toEqual([
      'appointment-1',
      'appointment-cancelled',
    ]);
    expect(privateSchedule?.appointments.find((appointment) => appointment.id === 'appointment-cancelled'))
      .toMatchObject({
        status: 'cancelled',
      });
  });

  it('lists private schedules by view with compact dashboard summaries', async () => {
    const t = createConvexTest();
    await seedSchedules(t);
    await seedUsersAndAppointment(t);
    const admin = await createAuthUser(t, 'admin');

    const asAdmin = t.withIdentity(admin.identity);

    const pastSchedules = await asAdmin.query(api.schedules.listPrivateSchedules, {
      view: 'past',
      search: '2026-02',
      paginationOpts: {
        numItems: 10,
        cursor: null,
      },
    });

    expect(pastSchedules.page).toEqual([
      {
        id: scheduleId,
        date: scheduleDate,
        open: '2026-02-02T15:00:00.000Z',
        close: '2026-02-02T21:00:00.000Z',
        appointmentCount: 1,
        appointmentStatusCounts: {
          scheduled: 1,
          'checked-in': 0,
          completed: 0,
        },
      },
    ]);

    const upcomingSchedules = await asAdmin.query(api.schedules.listPrivateSchedules, {
      view: 'upcoming',
      paginationOpts: {
        numItems: 10,
        cursor: null,
      },
    });

    expect(upcomingSchedules.page).toEqual([
      {
        id: otherScheduleId,
        date: futureScheduleDate,
        open: '2099-02-03T15:00:00.000Z',
        close: '2099-02-03T21:00:00.000Z',
        appointmentCount: 0,
        appointmentStatusCounts: {
          scheduled: 0,
          'checked-in': 0,
          completed: 0,
        },
      },
    ]);
  });

  it('returns private schedule dashboard stats', async () => {
    const t = createConvexTest();
    await seedSchedules(t);
    await seedUsersAndAppointment(t);
    const admin = await createAuthUser(t, 'admin');

    const asAdmin = t.withIdentity(admin.identity);
    const stats = await asAdmin.query(api.schedules.getPrivateScheduleStats, {});

    expect(stats).toEqual({
      totalSchedules: 2,
      totalAppointments: 1,
      upcomingSchedules: 1,
      pastSchedules: 1,
    });
  });
});
