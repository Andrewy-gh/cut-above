import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { QueryTypes, Sequelize } from 'sequelize';
import type { Transaction } from 'sequelize';
import { randomUUID } from 'node:crypto';
import { sequelize } from './db.js';
import { runWithDbContext } from './dbContext.js';
import { Appointment, PasswordResetToken, Schedule, User } from '../models/index.js';

const describeDb = process.env.SKIP_DB_TESTS ? describe.skip : describe;

const applyRlsPolicies = async () => {
  await sequelize.query(`
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE users FORCE ROW LEVEL SECURITY;

    CREATE POLICY users_select ON users
    FOR SELECT
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND (
          role = 'employee'
          OR email = nullif(current_setting('app.auth_email', true), '')
        )
      )
      OR EXISTS (
        SELECT 1
        FROM appointments a
        WHERE (
          a.client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
          OR a.employee_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        )
        AND (a.client_id = users.id OR a.employee_id = users.id)
      )
    );

    CREATE POLICY users_insert ON users
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND role = 'client'
      )
    );

    CREATE POLICY users_update ON users
    FOR UPDATE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    )
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    );

    CREATE POLICY users_delete ON users
    FOR DELETE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE appointments FORCE ROW LEVEL SECURITY;

    CREATE POLICY appointments_select ON appointments
    FOR SELECT
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR current_setting('app.current_user_role', true) = 'public'
      OR client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR employee_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    );

    CREATE POLICY appointments_insert ON appointments
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'client'
        AND client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
      )
    );

    CREATE POLICY appointments_update ON appointments
    FOR UPDATE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR employee_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    )
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR employee_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    );

    CREATE POLICY appointments_delete ON appointments
    FOR DELETE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR employee_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    );

    ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE schedules FORCE ROW LEVEL SECURITY;

    CREATE POLICY schedules_select ON schedules
    FOR SELECT
    USING (
      current_setting('app.current_user_role', true) IN ('public', 'client', 'employee', 'admin', 'service')
    );

    CREATE POLICY schedules_insert ON schedules
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    CREATE POLICY schedules_update ON schedules
    FOR UPDATE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    )
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    CREATE POLICY schedules_delete ON schedules
    FOR DELETE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
    ALTER TABLE password_reset_tokens FORCE ROW LEVEL SECURITY;

    CREATE POLICY password_reset_tokens_select ON password_reset_tokens
    FOR SELECT
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND user_id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
      OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    );

    CREATE POLICY password_reset_tokens_insert ON password_reset_tokens
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND user_id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    );

    CREATE POLICY password_reset_tokens_update ON password_reset_tokens
    FOR UPDATE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND user_id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    )
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND user_id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    );

    CREATE POLICY password_reset_tokens_delete ON password_reset_tokens
    FOR DELETE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND user_id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    );
  `);
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set for row level security tests');
}

const rlsRole = 'rls_test';
const rlsPassword = 'rls_test';
const rlsDatabaseUrl = new URL(databaseUrl);
rlsDatabaseUrl.username = rlsRole;
rlsDatabaseUrl.password = rlsPassword;

const rlsSequelize = new Sequelize(rlsDatabaseUrl.toString(), {
  logging: false,
});

const ensureRlsRole = async () => {
  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${rlsRole}') THEN
        CREATE ROLE ${rlsRole} LOGIN PASSWORD '${rlsPassword}';
      ELSE
        ALTER ROLE ${rlsRole} WITH LOGIN PASSWORD '${rlsPassword}';
      END IF;
    END $$;
  `);

  const dbName = new URL(databaseUrl).pathname.replace('/', '');
  await sequelize.query(`GRANT CONNECT ON DATABASE "${dbName}" TO ${rlsRole};`);
};

const grantRlsRole = async () => {
  await sequelize.query(`GRANT USAGE ON SCHEMA public TO ${rlsRole};`);
  await sequelize.query(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${rlsRole};`
  );
};

const applyRlsContext = async (
  context: {
    role: 'public' | 'client' | 'employee' | 'admin' | 'service';
    userId?: string | null;
    authEmail?: string | null;
    authUserId?: string | null;
  },
  transaction: Transaction
) => {
  await rlsSequelize.query(
    `SELECT
      set_config('app.current_user_role', :role, true),
      set_config('app.current_user_id', :userId, true),
      set_config('app.auth_email', :authEmail, true),
      set_config('app.auth_user_id', :authUserId, true);`,
    {
      replacements: {
        role: context.role ?? '',
        userId: context.userId ?? '',
        authEmail: context.authEmail ?? '',
        authUserId: context.authUserId ?? '',
      },
      transaction,
    }
  );
};

const withRlsContext = async <T>(
  context: {
    role: 'public' | 'client' | 'employee' | 'admin' | 'service';
    userId?: string | null;
    authEmail?: string | null;
    authUserId?: string | null;
  },
  fn: (transaction: Transaction) => Promise<T>
) =>
  rlsSequelize.transaction(async (transaction) => {
    await applyRlsContext(context, transaction);
    return fn(transaction);
  });

const withContext = <T>(
  context: {
    role: 'public' | 'client' | 'employee' | 'admin' | 'service';
    userId?: string | null;
    authEmail?: string | null;
    authUserId?: string | null;
  },
  fn: (transaction: Transaction) => Promise<T>
) => runWithDbContext(context, async (transaction) => fn(transaction));

const expectRlsViolation = async (promise: Promise<unknown>) => {
  await expect(promise).rejects.toThrow(/row-level security/i);
};

const seedUsers = async () =>
  withContext({ role: 'service' }, async (transaction) => {
    const client = await User.create(
      {
        firstName: 'Client',
        lastName: 'One',
        email: 'client@test.com',
        passwordHash: 'hash',
        role: 'client',
      },
      { transaction }
    );
    const otherClient = await User.create(
      {
        firstName: 'Client',
        lastName: 'Two',
        email: 'client2@test.com',
        passwordHash: 'hash',
        role: 'client',
      },
      { transaction }
    );
    const employee = await User.create(
      {
        firstName: 'Employee',
        lastName: 'One',
        email: 'employee@test.com',
        passwordHash: 'hash',
        role: 'employee',
      },
      { transaction }
    );
    return { client, otherClient, employee };
  });

const seedSchedule = async () =>
  withContext({ role: 'service' }, async (transaction) =>
    Schedule.create(
      {
        open: new Date('2024-01-22T14:00:00.000Z'),
        close: new Date('2024-01-22T22:00:00.000Z'),
      },
      { transaction }
    )
  );

describeDb('row level security', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
    await ensureRlsRole();
    await grantRlsRole();
    await applyRlsPolicies();
  });

  afterAll(async () => {
    await rlsSequelize.close();
  });

  it('public can read employees and auth email users only', async () => {
    const { client, otherClient, employee } = await seedUsers();

    const visible = await withRlsContext(
      { role: 'public', authEmail: client.email },
      async (transaction) =>
        rlsSequelize.query<{ email: string }>('SELECT email FROM users ORDER BY email ASC;', {
          type: QueryTypes.SELECT,
          transaction,
        })
    );

    const emails = visible.map((user) => user.email).sort();
    expect(emails).toEqual([client.email, employee.email].sort());
    expect(emails).not.toContain(otherClient.email);
  });

  it('public can only insert client users', async () => {
    await withRlsContext({ role: 'public' }, async (transaction) =>
      rlsSequelize.query(
        `INSERT INTO users (id, first_name, last_name, email, password_hash, role)
         VALUES (:id, :firstName, :lastName, :email, :passwordHash, :role);`,
        {
          replacements: {
            id: randomUUID(),
            firstName: 'Public',
            lastName: 'Client',
            email: 'public-client@test.com',
            passwordHash: 'hash',
            role: 'client',
          },
          transaction,
        }
      )
    );

    await expectRlsViolation(
      withRlsContext({ role: 'public' }, async (transaction) =>
        rlsSequelize.query(
          `INSERT INTO users (id, first_name, last_name, email, password_hash, role)
           VALUES (:id, :firstName, :lastName, :email, :passwordHash, :role);`,
          {
            replacements: {
              id: randomUUID(),
              firstName: 'Public',
              lastName: 'Employee',
              email: 'public-employee@test.com',
              passwordHash: 'hash',
              role: 'employee',
            },
            transaction,
          }
        )
      )
    );
  });

  it('client only sees their own appointments', async () => {
    const { client, otherClient, employee } = await seedUsers();
    const schedule = await seedSchedule();

    await withContext({ role: 'service' }, async (transaction) => {
      await Appointment.create(
        {
          start: new Date('2024-01-22T17:00:00.000Z'),
          end: new Date('2024-01-22T17:30:00.000Z'),
          service: 'Haircut',
          status: 'scheduled',
          clientId: client.id,
          employeeId: employee.id,
          scheduleId: schedule.id,
        },
        { transaction }
      );
      await Appointment.create(
        {
          start: new Date('2024-01-22T18:00:00.000Z'),
          end: new Date('2024-01-22T18:30:00.000Z'),
          service: 'Haircut',
          status: 'scheduled',
          clientId: otherClient.id,
          employeeId: employee.id,
          scheduleId: schedule.id,
        },
        { transaction }
      );
    });

    const visible = await withRlsContext(
      { role: 'client', userId: client.id },
      async (transaction) =>
        rlsSequelize.query<{ client_id: string }>(
          'SELECT client_id FROM appointments ORDER BY start ASC;',
          { type: QueryTypes.SELECT, transaction }
        )
    );

    expect(visible).toHaveLength(1);
    expect(visible[0]?.client_id).toBe(client.id);
  });

  it('public can read schedules but cannot write', async () => {
    await seedSchedule();

    const visible = await withRlsContext({ role: 'public' }, async (transaction) =>
      rlsSequelize.query<{ id: string }>('SELECT id FROM schedules ORDER BY open ASC;', {
        type: QueryTypes.SELECT,
        transaction,
      })
    );

    expect(visible).toHaveLength(1);

    await expectRlsViolation(
      withRlsContext({ role: 'public' }, async (transaction) =>
        rlsSequelize.query(
          `INSERT INTO schedules (id, open, close)
           VALUES (:id, :open, :close);`,
          {
            replacements: {
              id: randomUUID(),
              open: '2024-01-23T14:00:00.000Z',
              close: '2024-01-23T22:00:00.000Z',
            },
            transaction,
          }
        )
      )
    );
  });

  it('public can access only auth user reset tokens', async () => {
    const { client, otherClient } = await seedUsers();

    await withContext({ role: 'service' }, async (transaction) => {
      await PasswordResetToken.create(
        {
          tokenHash: 'hash-1',
          userId: client.id,
        },
        { transaction }
      );
      await PasswordResetToken.create(
        {
          tokenHash: 'hash-2',
          userId: otherClient.id,
        },
        { transaction }
      );
    });

    const visible = await withRlsContext(
      { role: 'public', authUserId: client.id },
      async (transaction) =>
        rlsSequelize.query<{ user_id: string }>(
          'SELECT user_id FROM password_reset_tokens ORDER BY user_id ASC;',
          { type: QueryTypes.SELECT, transaction }
        )
    );

    expect(visible).toHaveLength(1);
    expect(visible[0]?.user_id).toBe(client.id);

    await withRlsContext({ role: 'public', authUserId: client.id }, async (transaction) =>
      rlsSequelize.query(
        `INSERT INTO password_reset_tokens (id, token_hash, user_id)
           VALUES (:id, :tokenHash, :userId);`,
        {
          replacements: {
            id: randomUUID(),
            tokenHash: 'hash-3',
            userId: client.id,
          },
          transaction,
        }
      )
    );

    await expectRlsViolation(
      withRlsContext({ role: 'public', authUserId: client.id }, async (transaction) =>
        rlsSequelize.query(
          `INSERT INTO password_reset_tokens (id, token_hash, user_id)
             VALUES (:id, :tokenHash, :userId);`,
          {
            replacements: {
              id: randomUUID(),
              tokenHash: 'hash-4',
              userId: otherClient.id,
            },
            transaction,
          }
        )
      )
    );
  });
});
