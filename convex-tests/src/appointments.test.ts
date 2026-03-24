import { describe, expect, it, vi } from 'vitest';

import { api, components } from '../../convex/_generated/api';
import { appointmentSideEffects } from '../../convex/lib/appointments';
import { createConvexTest } from './convexTest';

const scheduleDate = '2026-02-02';
const scheduleId = 'schedule-1';
const employeeId = 'employee-1';
const service = 'Haircut';
const startTime = '2026-02-02T15:00:00.000Z';
const endTime = '2026-02-02T16:00:00.000Z';

const createAuthUser = async (t: ReturnType<typeof createConvexTest>, role: string) => {
  const now = Date.now();
  const name = role === 'client' ? 'Client User' : 'Admin User';
  const email = role === 'client' ? 'client@example.com' : 'admin@example.com';

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
    identity: {
      subject: authUserId,
      sessionId,
      name,
      email,
    },
  };
};

const seedEmployee = async (t: ReturnType<typeof createConvexTest>) => {
  const now = Date.now();
  await t.run(async (ctx) => {
    await ctx.db.insert('users', {
      id: employeeId,
      name: 'Employee',
      email: 'employee@example.com',
      role: 'employee',
      createdAt: now,
      updatedAt: now,
    });
  });
};

const seedSchedule = async (t: ReturnType<typeof createConvexTest>) => {
  await t.run(async (ctx) => {
    await ctx.db.insert('schedules', {
      id: scheduleId,
      date: scheduleDate,
      open: startTime,
      close: endTime,
    });
  });
};

const seedAppointment = async (t: ReturnType<typeof createConvexTest>) => {
  await t.run(async (ctx) => {
    await ctx.db.insert('appointments', {
      id: 'existing-appt',
      status: 'scheduled',
      service,
      start: startTime,
      end: endTime,
      clientId: 'client-1',
      employeeId,
      scheduleId,
    });
  });
};

const seedAvailabilityWindow = async (
  t: ReturnType<typeof createConvexTest>,
  input: { employeeId: string; weekday: number; startTime: string; endTime: string }
) => {
  await t.run(async (ctx) => {
    await ctx.db.insert('employeeAvailabilityRules', {
      id: `rule-${input.employeeId}-${input.weekday}-${input.startTime}`,
      employeeId: input.employeeId,
      weekday: input.weekday,
      isWorking: true,
      startTime: input.startTime,
      endTime: input.endTime,
      updatedAt: Date.now(),
    });
  });
};

describe('appointments.createAppointment', () => {
  it(
    'creates a booking and queues a confirmation email',
    { timeout: 15000 },
    async () => {
      const t = createConvexTest();
      await seedSchedule(t);
      await seedEmployee(t);
      const client = await createAuthUser(t, 'client');

      const asClient = t.withIdentity(client.identity);
      await expect(
        asClient.mutation(api.appointments.createAppointment, {
          start: startTime,
          end: endTime,
          service,
          employee: { id: employeeId, firstName: 'Pat' },
        })
      ).resolves.toMatchObject({ success: true, message: 'Appointment successfully created' });

      const storedAppointments = await t.run((ctx) =>
        ctx.db
          .query('appointments')
          .withIndex('by_schedule', (q) => q.eq('scheduleId', scheduleId))
          .collect()
      );
      expect(storedAppointments).toHaveLength(1);
      expect(storedAppointments[0]).toMatchObject({
        status: 'scheduled',
        service,
        start: startTime,
        end: endTime,
        clientId: client.identity.subject,
        employeeId,
        scheduleId,
      });

      const outboxItems = await t.run((ctx) => ctx.db.query('emailOutbox').collect());
      expect(outboxItems).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            eventType: 'appointment.confirmation',
            payload: expect.objectContaining({
              receiver: client.identity.email,
              employee: 'Pat',
              option: 'confirmation',
            }),
          }),
        ])
      );
    }
  );

  it(
    'rejects conflicting bookings for the same employee',
    { timeout: 15000 },
    async () => {
      const t = createConvexTest();
      await seedSchedule(t);
      await seedEmployee(t);
      const client = await createAuthUser(t, 'client');

      await seedAppointment(t);

      const asClient = t.withIdentity(client.identity);
      await expect(
        asClient.mutation(api.appointments.createAppointment, {
          start: '2026-02-02T15:30:00.000Z',
          end: '2026-02-02T16:30:00.000Z',
          service,
          employee: { id: employeeId, firstName: 'Pat' },
        })
      ).rejects.toThrow(/Time slot conflicts with existing appointment/);
    }
  );

  it('rejects invalid employee selections', async () => {
    const t = createConvexTest();
    const client = await createAuthUser(t, 'client');

    const asClient = t.withIdentity(client.identity);
    await expect(
      asClient.mutation(api.appointments.createAppointment, {
        start: startTime,
        end: endTime,
        service,
        employee: { id: 'missing-employee', firstName: 'Missing' },
      })
    ).rejects.toThrow(/Invalid employee/);
  });

  it('rejects unauthenticated bookings', async () => {
    const t = createConvexTest();

    await expect(
      t.mutation(api.appointments.createAppointment, {
        start: startTime,
        end: endTime,
        service,
        employee: { id: employeeId, firstName: 'Pat' },
      })
    ).rejects.toThrow(/Not authenticated/);
  });

  it('rejects bookings when the employee is outside their booking window', async () => {
    const t = createConvexTest();
    await seedSchedule(t);
    await seedEmployee(t);
    await seedAvailabilityWindow(t, {
      employeeId,
      weekday: 1,
      startTime: '11:00',
      endTime: '12:00',
    });
    const client = await createAuthUser(t, 'client');

    const asClient = t.withIdentity(client.identity);
    await expect(
      asClient.mutation(api.appointments.createAppointment, {
        start: startTime,
        end: endTime,
        service,
        employee: { id: employeeId, firstName: 'Pat' },
      })
    ).rejects.toThrow(/Employee is unavailable for selected time/);
  });

  it('rolls back booking creation when confirmation enqueue fails', async () => {
    const t = createConvexTest();
    await seedSchedule(t);
    await seedEmployee(t);
    const client = await createAuthUser(t, 'client');
    const asClient = t.withIdentity(client.identity);
    const originalEnqueue = appointmentSideEffects.enqueueAppointmentEmail;

    appointmentSideEffects.enqueueAppointmentEmail = vi
      .fn()
      .mockRejectedValueOnce(new Error('Email outbox unavailable'));

    try {
      await expect(
        asClient.mutation(api.appointments.createAppointment, {
          start: startTime,
          end: endTime,
          service,
          employee: { id: employeeId, firstName: 'Pat' },
        })
      ).rejects.toThrow(/Email outbox unavailable/);
    } finally {
      appointmentSideEffects.enqueueAppointmentEmail = originalEnqueue;
    }

    const storedAppointments = await t.run((ctx) =>
      ctx.db
        .query('appointments')
        .withIndex('by_schedule', (q) => q.eq('scheduleId', scheduleId))
        .collect()
    );
    const outboxItems = await t.run((ctx) => ctx.db.query('emailOutbox').collect());

    expect(storedAppointments).toEqual([]);
    expect(outboxItems).toEqual([]);
  });

  it(
    'keeps cancelled appointments for admin schedules but frees the slot for rebooking',
    { timeout: 15000 },
    async () => {
      const t = createConvexTest();
      await seedSchedule(t);
      await seedEmployee(t);
      const client = await createAuthUser(t, 'client');
      const admin = await createAuthUser(t, 'admin');

      const asClient = t.withIdentity(client.identity);
      const asAdmin = t.withIdentity(admin.identity);

      await asClient.mutation(api.appointments.createAppointment, {
        start: startTime,
        end: endTime,
        service,
        employee: { id: employeeId, firstName: 'Pat' },
      });

      const createdAppointment = await t.run(async (ctx) =>
        ctx.db
          .query('appointments')
          .withIndex('by_schedule', (q) => q.eq('scheduleId', scheduleId))
          .first()
      );

      if (!createdAppointment) {
        throw new Error('Expected seeded appointment to exist.');
      }

      const cancelResult = await asClient.mutation(
        api.appointments.cancelAppointment,
        { id: createdAppointment.id }
      );

      expect(cancelResult.success).toBe(true);

      const persistedAppointment = await t.run(async (ctx) =>
        ctx.db
          .query('appointments')
          .withIndex('by_appointment_id', (q) => q.eq('id', createdAppointment.id))
          .first()
      );

      expect(persistedAppointment?.status).toBe('cancelled');

      const adminSchedule = await asAdmin.query(api.schedules.getPrivateScheduleById, {
        id: scheduleId,
      });
      const adminAppointment = adminSchedule?.appointments[0];
      expect(adminAppointment?.status).toBe('cancelled');

      await expect(asClient.query(api.appointments.getAppointments, {})).resolves.toEqual([]);

      await expect(
        asClient.mutation(api.appointments.createAppointment, {
          start: startTime,
          end: endTime,
          service,
          employee: { id: employeeId, firstName: 'Pat' },
        })
      ).resolves.toMatchObject({ success: true });
    }
  );

  it('rejects services outside the shared booking contract', async () => {
    const t = createConvexTest();
    await seedSchedule(t);
    await seedEmployee(t);
    const client = await createAuthUser(t, 'client');

    const asClient = t.withIdentity(client.identity);
    await expect(
      asClient.mutation(api.appointments.createAppointment, {
        start: startTime,
        end: endTime,
        service: 'Cut' as never,
        employee: { id: employeeId, firstName: 'Pat' },
      })
    ).rejects.toThrow(/Validator error/);
  });
});

describe('appointments.updateAppointmentStatus', () => {
  it('rejects statuses outside the shared booking contract', async () => {
    const t = createConvexTest();
    await seedSchedule(t);
    await seedEmployee(t);
    await seedAppointment(t);
    const admin = await createAuthUser(t, 'admin');

    const asAdmin = t.withIdentity(admin.identity);
    await expect(
      asAdmin.mutation(api.appointments.updateAppointmentStatus, {
        id: 'existing-appt',
        status: 'invalid-status' as never,
      })
    ).rejects.toThrow(/Validator error/);
  });
});
