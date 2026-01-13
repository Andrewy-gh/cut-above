import session, { type SessionOptions } from 'express-session';
import type { RequestHandler } from 'express';
import RedisStore from 'connect-redis';
import { SESSION_SECRET } from '../utils/config.js';
import { redisClient } from '../utils/redis.js';

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be defined in environment variables');
}

const sessionConfig: SessionOptions = {
  store: new RedisStore({
    client: redisClient,
    prefix: 'session:',
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'cutabove',
  cookie: {
    secure: process.env.NODE_ENV === 'development' ? false : true, // change to true in production
    httpOnly: true, // if true: prevents client side JS from reading the cookie
    maxAge: 1000 * 60 * 60, // session max age in milliseconds, currently 60 minutes
    sameSite: 'lax',
  },
};

const sessionMiddleware: RequestHandler = session(sessionConfig);
export default sessionMiddleware;
