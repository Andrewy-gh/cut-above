import { describe, expect, it } from 'vitest';

import { api, components } from '../../convex/_generated/api';
import { createConvexTest } from './convexTest';

const service = 'Haircut';
const updatedService = 'Beard Trim';

const extractTokenFromLink = (emailLink: string) => {
  const parsedUrl = new URL(emailLink);
  const token = parsedUrl.searchParams.get('token');
  if (!token) {
    throw new Error(`Missing token in email link: ${emailLink}`);
  }
  return token;
};

const createAuthUser = async (
  t: ReturnType<typeof createConvexTest>,
  role: 'client' | 'admin'
) => {
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
    userId: authUserId,
    identity: {
      subject: authUserId,
      sessionId,
      name,
      email,
    },
  };
};

const seedEmployee = async (
  t: ReturnType<typeof createConvexTest>,
  employeeId: string
) => {
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

const seedSchedule = async (
  t: ReturnType<typeof createConvexTest>,
  input: {
    scheduleId: string;
    scheduleDate: string;
    open: string;
    close: string;
  }
) => {
  await t.run(async (ctx) => {
    await ctx.db.insert('schedules', {
      id: input.scheduleId,
      date: input.scheduleDate,
      open: input.open,
      close: input.close,
    });
  });
};

const getEmailLinkByEvent = async (
  t: ReturnType<typeof createConvexTest>,
  eventType: string
) => {
  const outboxItems = await t.run((ctx) => ctx.db.query('emailOutbox').collect());
  const matching = outboxItems.filter((item) => item.eventType === eventType);
  const latest = matching.at(-1);
  const emailLink = latest?.payload?.emailLink;
  if (typeof emailLink !== 'string') {
    throw new Error(`Email link missing for event type: ${eventType}`);
  }
  return emailLink;
};

describe('appointment lifecycle via manage token', () => {
  it(
    'supports create, token reschedule, token rotation, token cancel, and visibility changes',
    { timeout: 15000 },
    async () => {
      const t = createConvexTest();
      const suffix = crypto.randomUUID();
      const employeeId = `employee-${suffix}`;
      const scheduleId = `schedule-${suffix}`;
      const scheduleDate = '2027-03-02';
      const startTime = '2027-03-02T15:00:00.000Z';
      const endTime = '2027-03-02T16:00:00.000Z';
      const updatedStartTime = '2027-03-02T17:00:00.000Z';
      const updatedEndTime = '2027-03-02T18:00:00.000Z';

      await seedSchedule(t, {
        scheduleId,
        scheduleDate,
        open: startTime,
        close: '2027-03-02T22:00:00.000Z',
      });
      await seedEmployee(t, employeeId);

      const client = await createAuthUser(t, 'client');
      const admin = await createAuthUser(t, 'admin');
      const asClient = t.withIdentity(client.identity);
      const asAdmin = t.withIdentity(admin.identity);

      await expect(
        asClient.mutation(api.appointments.createAppointment, {
          start: startTime,
          end: endTime,
          service,
          employee: { id: employeeId, firstName: 'Pat' },
        })
      ).resolves.toMatchObject({ success: true });

      const initialAppointments = await asClient.query(
        api.appointments.getAppointments,
        {}
      );
      expect(initialAppointments).toHaveLength(1);
      expect(initialAppointments[0]).toMatchObject({
        service,
        start: startTime,
        status: 'scheduled',
      });

      const confirmationToken = extractTokenFromLink(
        await getEmailLinkByEvent(t, 'appointment.confirmation')
      );

      await expect(
        t.mutation(api.appointments.modifyManagedAppointmentByToken, {
          token: confirmationToken,
          start: updatedStartTime,
          end: updatedEndTime,
          service: updatedService,
          employee: { id: employeeId, firstName: 'Pat' },
        })
      ).resolves.toMatchObject({ success: true });

      await expect(
        t.query(api.appointments.getManagedAppointmentByToken, {
          token: confirmationToken,
        })
      ).rejects.toThrow(/invalid or has expired/i);

      const rotatedToken = extractTokenFromLink(
        await getEmailLinkByEvent(t, 'appointment.modification')
      );

      const managedAppointment = await t.query(
        api.appointments.getManagedAppointmentByToken,
        {
          token: rotatedToken,
        }
      );
      expect(managedAppointment).toMatchObject({
        service: updatedService,
        start: updatedStartTime,
        status: 'scheduled',
      });

      const rescheduledAppointments = await asClient.query(
        api.appointments.getAppointments,
        {}
      );
      expect(rescheduledAppointments).toHaveLength(1);
      expect(rescheduledAppointments[0]).toMatchObject({
        service: updatedService,
        start: updatedStartTime,
        status: 'scheduled',
      });

      await expect(
        t.mutation(api.appointments.cancelManagedAppointmentByToken, {
          token: rotatedToken,
        })
      ).resolves.toMatchObject({ success: true });

      await expect(
        t.query(api.appointments.getManagedAppointmentByToken, {
          token: rotatedToken,
        })
      ).rejects.toThrow(/invalid or has expired/i);

      await expect(asClient.query(api.appointments.getAppointments, {})).resolves.toEqual(
        []
      );

      const publicSchedule = await t.query(api.schedules.getPublicScheduleByDate, {
        date: scheduleDate,
      });
      expect(publicSchedule).not.toBeNull();
      expect(publicSchedule?.appointments).toEqual([]);

      const privateSchedule = await asAdmin.query(
        api.schedules.getPrivateScheduleById,
        { id: scheduleId }
      );
      expect(privateSchedule).not.toBeNull();
      expect(privateSchedule?.appointments).toHaveLength(1);
      expect(privateSchedule?.appointments[0]).toMatchObject({
        service: updatedService,
        start: updatedStartTime,
        status: 'cancelled',
      });
    }
  );
});
