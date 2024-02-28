import crypto from 'crypto';
import { users, appointments } from './data.js';
import { Appointment, PasswordResetToken, User } from '../models/index.js';
import logger from './logger/index.js';

export const seedData = async () => {
  const newUsers = await User.bulkCreate(users);
  logger.info('new users created');
  logger.info(JSON.stringify(newUsers));
};

export const seedTokens = async () => {
  const tokens = Array.from({ length: 10 }, () => ({
    tokenHash: crypto.randomBytes(32).toString('hex'),
    expiresAt: '2024-02-23T13:47:32.126Z',
  }));
  const newTokens = await PasswordResetToken.bulkCreate(tokens);
  logger.info('new tokens created');
  logger.info(JSON.stringify(newTokens));
};

seedTokens();
