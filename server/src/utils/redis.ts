import { Redis } from 'ioredis';
import { REDIS_URL } from './config.js';

export const redisClient = new Redis(REDIS_URL);
export const pub = new Redis(REDIS_URL);
export const sub = new Redis(REDIS_URL);
