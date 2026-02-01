import { sequelize } from './db.js';
import type { Transaction } from 'sequelize';

export type DbRole = 'public' | 'client' | 'employee' | 'admin' | 'service';

export type DbContext = {
  role?: DbRole | null;
  userId?: string | null;
  authEmail?: string | null;
  authUserId?: string | null;
};

const normalizeValue = (value?: string | null) => value ?? '';

const hasActiveTransaction = (transaction?: Transaction) => {
  if (transaction) return true;
  const cls = (
    sequelize.constructor as {
      _cls?: { get: (key: string) => unknown };
    }
  )._cls;
  if (!cls) return false;
  return Boolean(cls.get('transaction'));
};

export const applyDbContext = async (
  context: DbContext,
  options: { transaction?: Transaction } = {}
) => {
  const replacements = {
    role: normalizeValue(context.role),
    userId: normalizeValue(context.userId),
    authEmail: normalizeValue(context.authEmail),
    authUserId: normalizeValue(context.authUserId),
    isLocal: hasActiveTransaction(options.transaction),
  };

  await sequelize.query(
    `SELECT
      set_config('app.current_user_role', :role, :isLocal),
      set_config('app.current_user_id', :userId, :isLocal),
      set_config('app.auth_email', :authEmail, :isLocal),
      set_config('app.auth_user_id', :authUserId, :isLocal);`,
    { replacements, transaction: options.transaction }
  );
};

export const setDbContextValue = async (
  key: string,
  value?: string | null,
  options: { transaction?: Transaction } = {}
) => {
  const isLocal = hasActiveTransaction(options.transaction);
  await sequelize.query('SELECT set_config(:key, :value, :isLocal)', {
    replacements: {
      key,
      value: normalizeValue(value),
      isLocal,
    },
    transaction: options.transaction,
  });
};

export const runWithDbContext = async <T>(
  context: DbContext,
  fn: (transaction: Transaction) => Promise<T>
) =>
  sequelize.transaction(async (transaction) => {
    await applyDbContext(context, { transaction });
    return fn(transaction);
  });
