import { describe, expect, it } from 'vitest';

import { api, components } from '../../convex/_generated/api';
import { createConvexTest } from './convexTest';

const service = 'Cut';

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
  role: string
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

const createAppointmentAndGetManageToken = async (
  t: ReturnType<typeof createConvexTest>
) => {
  const suffix = crypto.randomUUID();
  const scheduleDate = '2027-02-02';
  const employeeId = `employee-${suffix}`;
  const startTime = '2027-02-02T15:00:00.000Z';
  const endTime = '2027-02-02T16:00:00.000Z';
  await seedSchedule(t, {
    scheduleId: `schedule-${suffix}`,
    scheduleDate,
    open: startTime,
    close: '2027-02-02T22:00:00.000Z',
  });
  await seedEmployee(t, employeeId);
  const client = await createAuthUser(t, 'client');

  const asClient = t.withIdentity(client.identity);
  await asClient.mutation(api.appointments.createAppointment, {
    start: startTime,
    end: endTime,
    service,
    employee: { id: employeeId, firstName: 'Pat' },
  });

  const outboxItems = await t.run((ctx) => ctx.db.query('emailOutbox').collect());
  const confirmationEmail = outboxItems.find(
    (item) => item.eventType === 'appointment.confirmation'
  );
  const emailLink = confirmationEmail?.payload?.emailLink;
  if (typeof emailLink !== 'string') {
    throw new Error('Confirmation email link was not generated.');
  }

  return {
    employeeId,
    token: extractTokenFromLink(emailLink),
  };
};

describe('appointment manage access links', () => {
  it(
    'allows reading an appointment without full login via a scoped token',
    { timeout: 15000 },
    async () => {
      const t = createConvexTest();
      const { token, employeeId } = await createAppointmentAndGetManageToken(t);

      const appointment = await t.query(
        api.appointments.getManagedAppointmentByToken,
        {
          token,
        }
      );

      expect(appointment.service).toBe(service);
      expect(appointment.employee).toMatchObject({ id: employeeId });
    }
  );

  it(
    'rotates the manage token after a token-backed modification',
    { timeout: 15000 },
    async () => {
      const t = createConvexTest();
      const { token, employeeId } = await createAppointmentAndGetManageToken(t);

      await t.mutation(api.appointments.modifyManagedAppointmentByToken, {
        token,
        start: '2027-02-02T17:00:00.000Z',
        end: '2027-02-02T18:00:00.000Z',
        service: 'Line Up',
        employee: { id: employeeId, firstName: 'Pat' },
      });

      await expect(
        t.query(api.appointments.getManagedAppointmentByToken, { token })
      ).rejects.toThrow(/invalid or has expired/i);

      const outboxItems = await t.run((ctx) => ctx.db.query('emailOutbox').collect());
      const modificationEmail = outboxItems.find(
        (item) => item.eventType === 'appointment.modification'
      );
      const emailLink = modificationEmail?.payload?.emailLink;
      if (typeof emailLink !== 'string') {
        throw new Error('Modification email link was not generated.');
      }

      const rotatedToken = extractTokenFromLink(emailLink);
      const appointment = await t.query(
        api.appointments.getManagedAppointmentByToken,
        {
          token: rotatedToken,
        }
      );

      expect(appointment.service).toBe('Line Up');
      expect(appointment.start).toBe('2027-02-02T17:00:00.000Z');
    }
  );

  it(
    'revokes the manage token after cancellation',
    { timeout: 15000 },
    async () => {
      const t = createConvexTest();
      const { token } = await createAppointmentAndGetManageToken(t);

      const result = await t.mutation(
        api.appointments.cancelManagedAppointmentByToken,
        {
          token,
        }
      );

      expect(result.success).toBe(true);
      await expect(
        t.query(api.appointments.getManagedAppointmentByToken, { token })
      ).rejects.toThrow(/invalid or has expired/i);
    }
  );
});
