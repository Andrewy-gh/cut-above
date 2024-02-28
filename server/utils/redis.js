import { Redis } from 'ioredis';
import {
  REDIS_PORT,
  REDIS_HOST,
  REDIS_USERNAME,
  REDIS_PASSWORD,
} from './config.js';

const redisConfig = {
  port: REDIS_PORT, // Redis port
  host: REDIS_HOST, // Redis host
  username: REDIS_USERNAME, // needs Redis >= 6
  password: REDIS_PASSWORD,
  db: 0, // Defaults to 0
};

export const redisClient = new Redis(redisConfig);
export const pub = new Redis(redisConfig);
export const sub = new Redis(redisConfig);
