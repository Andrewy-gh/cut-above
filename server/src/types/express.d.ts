import 'express-session';
import type { InferAttributes } from 'sequelize';
import type User from '../models/User.js';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
    user?: Omit<InferAttributes<User>, 'passwordHash'>;
  }
}
