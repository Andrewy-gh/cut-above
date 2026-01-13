import { Redis } from 'ioredis';
import { REDIS_URL } from './config.js';

if (!REDIS_URL) {
  throw new Error('REDIS_URL must be defined in environment variables');
}

export const redisClient = new Redis(REDIS_URL);
export const pub = new Redis(REDIS_URL);
export const sub = new Redis(REDIS_URL);

