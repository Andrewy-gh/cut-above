import { describe, expect, it } from 'vitest';

import { api, components, internal } from '../../convex/_generated/api';
import { createConvexTest } from './convexTest';

const createBetterAuthUser = async (
  t: ReturnType<typeof createConvexTest>,
  input: {
    name: string;
    email: string;
    createdAt?: number;
    updatedAt?: number;
  }
) => {
  const now = input.createdAt ?? Date.now();
  const authUser = await t.mutation(components.betterAuth.adapter.create, {
    input: {
      model: 'user',
      data: {
        name: input.name,
        email: input.email,
        emailVerified: false,
        createdAt: now,
        updatedAt: input.updatedAt ?? now,
      },
    },
  });

  const authUserId =
    (authUser as { id?: string; _id?: string }).id ??
    (authUser as { _id?: string })._id;
  if (!authUserId) {
    throw new Error('Auth user id missing from Better Auth adapter response.');
  }

  await t.mutation(internal.auth.onCreate, {
    model: 'user',
    doc: authUser,
  });

  return { authUserId, authUser };
};

const createUnsyncedAuthIdentity = async (
  t: ReturnType<typeof createConvexTest>,
  input: {
    name: string;
    email: string;
  }
) => {
  const now = Date.now();
  const authUser = await t.mutation(components.betterAuth.adapter.create, {
    input: {
      model: 'user',
      data: {
        name: input.name,
        email: input.email,
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
    throw new Error('Auth user id missing from Better Auth adapter response.');
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
    throw new Error('Session id missing from Better Auth adapter response.');
  }

  return {
    identity: {
      subject: authUserId,
      sessionId,
      name: input.name,
      email: input.email,
    },
    authUserId,
    now,
  };
};

const createSyncedAuthIdentity = async (
  t: ReturnType<typeof createConvexTest>,
  input: {
    name: string;
    email: string;
  }
) => {
  const { authUserId } = await createBetterAuthUser(t, input);
  const now = Date.now();

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
    throw new Error('Session id missing from Better Auth adapter response.');
  }

  return {
    identity: {
      subject: authUserId,
      sessionId,
      name: input.name,
      email: input.email,
    },
    authUserId,
  };
};

describe('auth session sync and current-user resolution', () => {
  it(
    'syncs Better Auth user creation into the app users table with parsed names',
    { timeout: 10000 },
    async () => {
      const t = createConvexTest();
      const now = Date.now();

      const { authUserId } = await createBetterAuthUser(t, {
        name: 'Jamie Barber',
        email: 'jamie@example.com',
        createdAt: now,
        updatedAt: now,
      });

      const syncedUser = await t.run((ctx) =>
        ctx.db
          .query('users')
          .withIndex('by_user_id', (q) => q.eq('id', authUserId))
          .first()
      );

      expect(syncedUser).toMatchObject({
        id: authUserId,
        email: 'jamie@example.com',
        role: 'client',
        name: 'Jamie Barber',
        firstName: 'Jamie',
        lastName: 'Barber',
        createdAt: now,
        updatedAt: now,
      });
    }
  );

  it('keeps the synced app user in step with Better Auth profile updates', async () => {
    const t = createConvexTest();
    const { authUserId, authUser } = await createBetterAuthUser(t, {
      name: 'Jamie Barber',
      email: 'jamie@example.com',
    });
    const updatedAt = Date.now() + 1000;

    const updatedAuthUser = await t.mutation(components.betterAuth.adapter.updateOne, {
      input: {
        model: 'user',
        where: [{ field: '_id', operator: 'eq', value: authUserId }],
        update: {
          name: 'Jordan Admin',
          email: 'jordan@example.com',
          updatedAt,
        },
      },
    });

    await t.mutation(internal.auth.onUpdate, {
      model: 'user',
      oldDoc: authUser,
      newDoc: updatedAuthUser,
    });

    const syncedUser = await t.run((ctx) =>
      ctx.db
        .query('users')
        .withIndex('by_user_id', (q) => q.eq('id', authUserId))
        .first()
    );

    expect(syncedUser).toMatchObject({
      id: authUserId,
      email: 'jordan@example.com',
      role: 'client',
      name: 'Jordan Admin',
      firstName: 'Jordan',
      lastName: 'Admin',
      updatedAt,
    });
  });

  it('resolves the synced app user for the current session so app roles win', async () => {
    const t = createConvexTest();
    const { identity, authUserId } = await createSyncedAuthIdentity(t, {
      name: 'Alex Manager',
      email: 'alex@example.com',
    });

    await t.run(async (ctx) => {
      const user = await ctx.db
        .query('users')
        .withIndex('by_user_id', (q) => q.eq('id', authUserId))
        .first();

      if (!user) {
        throw new Error('Expected synced app user to exist.');
      }

      await ctx.db.patch(user._id, {
        role: 'admin',
      });
    });

    const currentUser = await t.withIdentity(identity).query(api.auth.getCurrentUser, {});

    expect(currentUser).toMatchObject({
      id: authUserId,
      email: 'alex@example.com',
      role: 'admin',
      name: 'Alex Manager',
    });
  });

  it('falls back to the Better Auth session user when sync has not materialized yet', async () => {
    const t = createConvexTest();
    const { identity, authUserId, now } = await createUnsyncedAuthIdentity(t, {
      name: 'Taylor Client',
      email: 'taylor@example.com',
    });

    const currentUser = await t.withIdentity(identity).query(api.auth.getCurrentUser, {});

    expect(currentUser).toMatchObject({
      id: authUserId,
      email: 'taylor@example.com',
      role: 'client',
      name: 'Taylor Client',
      firstName: 'Taylor',
      lastName: 'Client',
      createdAt: now,
      updatedAt: now,
    });
  });

  it('removes the synced app user when Better Auth deletes the account', async () => {
    const t = createConvexTest();
    const { authUserId } = await createBetterAuthUser(t, {
      name: 'Riley Client',
      email: 'riley@example.com',
    });

    const deletedAuthUser = await t.mutation(components.betterAuth.adapter.deleteOne, {
      input: {
        model: 'user',
        where: [{ field: '_id', operator: 'eq', value: authUserId }],
      },
    });

    await t.mutation(internal.auth.onDelete, {
      model: 'user',
      doc: deletedAuthUser,
    });

    const syncedUser = await t.run((ctx) =>
      ctx.db
        .query('users')
        .withIndex('by_user_id', (q) => q.eq('id', authUserId))
        .first()
    );

    expect(syncedUser).toBeNull();
  });
});
