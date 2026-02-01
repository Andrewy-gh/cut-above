import { AsyncLocalStorage } from 'node:async_hooks';
import { Sequelize } from 'sequelize';
import { DATABASE_URL } from './config.js';
import logger from './logger/index.js';

type ClsStore = Map<string, unknown>;

const clsStorage = new AsyncLocalStorage<ClsStore>();

const clsNamespace = {
  run: (fn: () => unknown) => clsStorage.run(new Map(), fn),
  bind: <T extends (...args: unknown[]) => unknown>(fn: T) => {
    const store = clsStorage.getStore();
    if (!store) return fn;
    return ((...args: unknown[]) => clsStorage.run(store, () => fn(...args))) as T;
  },
  get: (key: string) => clsStorage.getStore()?.get(key),
  set: (key: string, value: unknown) => {
    const store = clsStorage.getStore();
    if (store) store.set(key, value);
  },
};

Sequelize.useCLS(clsNamespace);

let defaultDbRole: string | null = process.env.DB_DEFAULT_ROLE ?? null;

export const setDefaultDbRole = (role: string | null) => {
  defaultDbRole = role;
};

Sequelize.afterConnect(async (connection) => {
  if (!defaultDbRole) return;
  const queryable = connection as {
    query: (sql: string, params?: unknown[]) => Promise<unknown>;
  };
  await queryable.query('SELECT set_config($1, $2, false)', [
    'app.current_user_role',
    defaultDbRole,
  ]);
});

export const sequelize = new Sequelize(DATABASE_URL!, {
  dialectOptions:
    process.env.NODE_ENV === 'production'
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('connected to the database');
  } catch (error) {
    logger.error('failed to connect to database', error);
  }
  return null;
};
