import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import type { RequestHandler } from 'express';

let limiter: RequestHandler;

// Disable rate limiting in test environment
if (process.env.NODE_ENV === 'test') {
  limiter = (_req, _res, next) => next();
} else {
  const { redisClient } = await import('../utils/redis.js');
  const redisClientWithCall = redisClient as unknown as {
    call: (...args: string[]) => unknown;
  };
  const sendCommand = (...args: string[]) =>
    redisClientWithCall.call(...args) as Promise<never>;

  limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    store: new RedisStore({
      sendCommand,
    }),
    validate: {
      xForwardedForHeader: false, // Disable the X-Forwarded-For check
    },
  });
}

export default limiter;
