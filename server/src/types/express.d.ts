import type { UserRole } from './index.js';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
    userRole?: UserRole;
  }
}
