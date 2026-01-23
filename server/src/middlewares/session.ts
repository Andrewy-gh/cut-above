import session, { type SessionOptions } from 'express-session';
import type { RequestHandler } from 'express';
import { SESSION_SECRET } from '../utils/config.js';

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be defined in environment variables');
}

let sessionStore: SessionOptions['store'] | undefined;
if (process.env.NODE_ENV !== 'test') {
  const { default: RedisStore } = await import('connect-redis');
  const { redisClient } = await import('../utils/redis.js');
  sessionStore = new RedisStore({
    client: redisClient,
    prefix: 'session:',
  });
}

const sessionConfig: SessionOptions = {
  store: sessionStore,
  secret: SESSION_SECRET,
  resave: false,
  // In test mode, save uninitialized sessions to ensure cookies are set
  saveUninitialized: process.env.NODE_ENV === 'test',
  name: 'cutabove',
  cookie: {
    // Must be false for tests (no HTTPS) and development
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // if true: prevents client side JS from reading the cookie
    maxAge: 1000 * 60 * 60, // session max age in milliseconds, currently 60 minutes
    sameSite: 'lax',
  },
};

const sessionMiddleware: RequestHandler = session(sessionConfig);
export default sessionMiddleware;
