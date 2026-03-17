import { v } from 'convex/values';

import type { Doc } from './_generated/dataModel';
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  type ActionCtx,
} from './_generated/server';
import { components, internal } from './_generated/api';

const resolveId = (doc: unknown) => {
  if (!doc || typeof doc !== 'object') return null;
  const record = doc as { id?: string; _id?: string };
  return record.id ?? record._id ?? null;
};

const prefixUpperBound = (value: string) => `${value}\uffff`;

const SEED_RESET_PAGE_SIZE = 100;

const seedResetTable = v.union(
  v.literal('appointments'),
  v.literal('schedules'),
  v.literal('emailOutbox'),
  v.literal('emailDeliveries')
);

type SeedResetTable = 'appointments' | 'schedules' | 'emailOutbox' | 'emailDeliveries';

type SeedResetDoc =
  | Doc<'appointments'>
  | Doc<'schedules'>
  | Doc<'emailOutbox'>
  | Doc<'emailDeliveries'>;

const clearSeededTable = async (ctx: ActionCtx, table: SeedResetTable, idPrefix: string) => {
  let deleted = 0;

  for (;;) {
    const result = await ctx.runMutation(internal.seed.deleteSeededTableBatch, {
      table,
      idPrefix,
    });
    deleted += result.deleted;
    if (result.deleted === 0) {
      return deleted;
    }
  }
};

export const ensureAuthUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    const existing = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: 'user',
      where: [{ field: 'email', value: email }],
    });

    const existingId = resolveId(existing);
    if (existingId) {
      return { id: existingId };
    }

    const now = Date.now();
    const createdUser = await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: 'user',
        data: {
          name: args.name,
          email,
          emailVerified: false,
          createdAt: now,
          updatedAt: now,
        },
      },
    });

    const authUserId = resolveId(createdUser);
    if (!authUserId) {
      throw new Error('Seed failed to create auth user.');
    }

    await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: 'account',
        data: {
          accountId: authUserId,
          providerId: 'credential',
          userId: authUserId,
          password: args.passwordHash,
          createdAt: now,
          updatedAt: now,
        },
      },
    });

    return { id: authUserId };
  },
});

export const ensureAppUser = mutation({
  args: {
    authId: v.string(),
    name: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        id: args.authId,
        name: args.name,
        firstName: args.firstName,
        lastName: args.lastName,
        role: args.role,
        updatedAt: Date.now(),
      });
      return { id: args.authId, inserted: false };
    }

    const now = Date.now();
    await ctx.db.insert('users', {
      id: args.authId,
      name: args.name,
      firstName: args.firstName,
      lastName: args.lastName,
      email,
      role: args.role,
      createdAt: now,
      updatedAt: now,
    });

    return { id: args.authId, inserted: true };
  },
});

export const ensureSchedule = mutation({
  args: {
    id: v.optional(v.string()),
    date: v.string(),
    open: v.string(),
    close: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('schedules')
      .withIndex('by_date', (q) => q.eq('date', args.date))
      .first();

    if (existing) {
      return { id: existing.id, inserted: false };
    }

    const id = args.id ?? `schedule-${args.date}`;
    await ctx.db.insert('schedules', {
      id,
      date: args.date,
      open: args.open,
      close: args.close,
    });

    return { id, inserted: true };
  },
});

export const ensureAppointment = mutation({
  args: {
    id: v.string(),
    scheduleId: v.string(),
    start: v.string(),
    end: v.string(),
    service: v.string(),
    status: v.string(),
    clientId: v.string(),
    employeeId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('appointments')
      .withIndex('by_appointment_id', (q) => q.eq('id', args.id))
      .first();

    if (existing) {
      return { id: existing.id, inserted: false };
    }

    await ctx.db.insert('appointments', {
      id: args.id,
      status: args.status,
      service: args.service,
      start: args.start,
      end: args.end,
      clientId: args.clientId,
      employeeId: args.employeeId,
      scheduleId: args.scheduleId,
    });

    return { id: args.id, inserted: true };
  },
});

export const deleteSeededTableBatch = internalMutation({
  args: {
    table: seedResetTable,
    idPrefix: v.string(),
  },
  handler: async (ctx, args) => {
    const upperBound = prefixUpperBound(args.idPrefix);
    let docs: SeedResetDoc[] = [];

    switch (args.table) {
      case 'appointments':
        docs = (await ctx.db
          .query('appointments')
          .withIndex('by_appointment_id', (q) => q.gte('id', args.idPrefix).lt('id', upperBound))
          .take(SEED_RESET_PAGE_SIZE)) as SeedResetDoc[];
        break;
      case 'schedules':
        docs = (await ctx.db
          .query('schedules')
          .withIndex('by_schedule_id', (q) => q.gte('id', args.idPrefix).lt('id', upperBound))
          .take(SEED_RESET_PAGE_SIZE)) as SeedResetDoc[];
        break;
      case 'emailOutbox':
        docs = (await ctx.db
          .query('emailOutbox')
          .withIndex('by_outbox_id', (q) => q.gte('id', args.idPrefix).lt('id', upperBound))
          .take(SEED_RESET_PAGE_SIZE)) as SeedResetDoc[];
        break;
      case 'emailDeliveries':
        docs = (await ctx.db
          .query('emailDeliveries')
          .withIndex('by_delivery_id', (q) => q.gte('id', args.idPrefix).lt('id', upperBound))
          .take(SEED_RESET_PAGE_SIZE)) as SeedResetDoc[];
        break;
      default:
        docs = [];
        break;
    }

    let deleted = 0;
    for (const doc of docs) {
      await ctx.db.delete(doc._id);
      deleted += 1;
    }

    return { deleted };
  },
});

export const clearSeedData = action({
  args: {
    confirm: v.string(),
    idPrefix: v.string(),
    seededUserEmails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.confirm !== 'RESET_SEED_DATA') {
      throw new Error('Invalid reset confirmation token.');
    }

    const idPrefix = args.idPrefix.trim();
    if (!idPrefix) {
      throw new Error('idPrefix is required.');
    }

    const normalizedEmails = Array.from(
      new Set(args.seededUserEmails.map((email) => email.trim().toLowerCase()).filter(Boolean))
    );
    const paginationOpts = { cursor: null, numItems: 500 };

    let deletedAppointments = 0;
    let deletedSchedules = 0;
    let deletedOutbox = 0;
    let deletedDeliveries = 0;
    let deletedAppUsers = 0;
    let deletedAuthUsers = 0;

    deletedAppointments = await clearSeededTable(ctx, 'appointments', idPrefix);
    deletedSchedules = await clearSeededTable(ctx, 'schedules', idPrefix);
    deletedOutbox = await clearSeededTable(ctx, 'emailOutbox', idPrefix);
    deletedDeliveries = await clearSeededTable(ctx, 'emailDeliveries', idPrefix);

    for (const email of normalizedEmails) {
      const appUser = await ctx.runQuery(internal.seed.findAppUserByEmail, {
        email,
      });
      if (appUser) {
        await ctx.runMutation(internal.seed.deleteAppUserById, {
          userId: appUser._id,
        });
        deletedAppUsers += 1;
      }

      const authUser = await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: 'user',
        where: [{ field: 'email', value: email }],
      });
      const authUserId = resolveId(authUser);
      if (!authUserId) continue;

      await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
        input: { model: 'session', where: [{ field: 'userId', value: authUserId }] },
        paginationOpts,
      });
      await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
        input: { model: 'account', where: [{ field: 'userId', value: authUserId }] },
        paginationOpts,
      });
      await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
        input: { model: 'verification', where: [{ field: 'identifier', value: email }] },
        paginationOpts,
      });
      await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
        input: { model: 'twoFactor', where: [{ field: 'userId', value: authUserId }] },
        paginationOpts,
      });
      await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
        input: { model: 'passkey', where: [{ field: 'userId', value: authUserId }] },
        paginationOpts,
      });
      await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
        input: {
          model: 'oauthAccessToken',
          where: [{ field: 'userId', value: authUserId }],
        },
        paginationOpts,
      });
      await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
        input: { model: 'oauthConsent', where: [{ field: 'userId', value: authUserId }] },
        paginationOpts,
      });
      await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
        input: { model: 'user', where: [{ field: '_id', value: authUserId }] },
        paginationOpts,
      });
      deletedAuthUsers += 1;
    }

    return {
      deletedAppointments,
      deletedSchedules,
      deletedOutbox,
      deletedDeliveries,
      deletedAppUsers,
      deletedAuthUsers,
      affectedEmails: normalizedEmails.length,
    };
  },
});

export const findAppUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first(),
});

export const deleteAppUserById = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});
