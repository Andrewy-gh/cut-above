import { hashPassword } from 'better-auth/crypto';
import { describe, expect, it } from 'vitest';

import { api, components } from '../../convex/_generated/api';
import { createConvexTest } from './convexTest';

describe('seed.clearSeedData', () => {
  it('removes seed-prefixed records and seeded users across paginated batches', async () => {
    const t = createConvexTest();
    const passwordHash = await hashPassword('TestPassword123!');
    const extraSeedRows = 120;

    const employeeAuth = await t.mutation(api.seed.ensureAuthUser, {
      name: 'Andre Silva',
      email: 'andre.silva@cutabove.test',
      passwordHash,
    });
    const clientAuth = await t.mutation(api.seed.ensureAuthUser, {
      name: 'John Smith',
      email: 'john.smith@cutabove.test',
      passwordHash,
    });

    await t.mutation(api.seed.ensureAppUser, {
      authId: employeeAuth.id,
      name: 'Andre Silva',
      firstName: 'Andre',
      lastName: 'Silva',
      email: 'andre.silva@cutabove.test',
      role: 'employee',
    });
    await t.mutation(api.seed.ensureAppUser, {
      authId: clientAuth.id,
      name: 'John Smith',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@cutabove.test',
      role: 'client',
    });

    const scheduleDate = '2026-03-02';
    await t.mutation(api.seed.ensureSchedule, {
      id: 'seed-schedules-2026-03-02',
      date: scheduleDate,
      open: '2026-03-02T13:00:00.000Z',
      close: '2026-03-02T22:00:00.000Z',
    });

    await t.mutation(api.seed.ensureAppointment, {
      id: 'seed-appt-2026-03-02-andre-1',
      scheduleId: 'seed-schedules-2026-03-02',
      start: '2026-03-02T14:00:00.000Z',
      end: '2026-03-02T14:30:00.000Z',
      service: 'Haircut',
      status: 'scheduled',
      clientId: clientAuth.id,
      employeeId: employeeAuth.id,
    });

    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert('emailOutbox', {
        id: 'seed-outbox-1',
        eventType: 'seed.test',
        dedupeKey: 'seed-dedupe',
        payload: { receiver: 'john.smith@cutabove.test' },
        status: 'pending',
        attempts: 0,
        availableAt: now,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert('emailDeliveries', {
        id: 'seed-delivery-1',
        dedupeKey: 'seed-dedupe',
        status: 'sent',
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert('emailOutbox', {
        id: 'keep-outbox-1',
        eventType: 'seed.keep',
        dedupeKey: 'keep-dedupe',
        payload: { receiver: 'keep@cutabove.test' },
        status: 'pending',
        attempts: 0,
        availableAt: now,
        createdAt: now,
        updatedAt: now,
      });

      for (let index = 0; index < extraSeedRows; index += 1) {
        await ctx.db.insert('emailOutbox', {
          id: `seed-outbox-extra-${index}`,
          eventType: 'seed.test',
          dedupeKey: `seed-dedupe-extra-${index}`,
          payload: { receiver: 'john.smith@cutabove.test' },
          status: 'pending',
          attempts: 0,
          availableAt: now,
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.insert('emailDeliveries', {
          id: `seed-delivery-extra-${index}`,
          dedupeKey: `seed-dedupe-extra-${index}`,
          status: 'sent',
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    const result = await t.action(api.seed.clearSeedData, {
      confirm: 'RESET_SEED_DATA',
      idPrefix: 'seed-',
      seededUserEmails: ['andre.silva@cutabove.test', 'john.smith@cutabove.test'],
    });

    expect(result.deletedAppointments).toBe(1);
    expect(result.deletedSchedules).toBe(1);
    expect(result.deletedOutbox).toBe(extraSeedRows + 1);
    expect(result.deletedDeliveries).toBe(extraSeedRows + 1);
    expect(result.deletedAppUsers).toBe(2);
    expect(result.deletedAuthUsers).toBe(2);

    const schedule = await t.run((ctx) =>
      ctx.db
        .query('schedules')
        .withIndex('by_date', (q) => q.eq('date', scheduleDate))
        .first()
    );
    expect(schedule).toBeNull();

    const appointment = await t.run((ctx) =>
      ctx.db
        .query('appointments')
        .withIndex('by_appointment_id', (q) => q.eq('id', 'seed-appt-2026-03-02-andre-1'))
        .first()
    );
    expect(appointment).toBeNull();

    const remainingOutbox = await t.run((ctx) =>
      ctx.db
        .query('emailOutbox')
        .withIndex('by_dedupe_key', (q) => q.eq('dedupeKey', 'keep-dedupe'))
        .first()
    );
    expect(remainingOutbox).not.toBeNull();

    const deletedAuthUser = await t.query(components.betterAuth.adapter.findOne, {
      model: 'user',
      where: [{ field: 'email', value: 'andre.silva@cutabove.test' }],
    });
    expect(deletedAuthUser).toBeNull();
  }, 15_000);
});
