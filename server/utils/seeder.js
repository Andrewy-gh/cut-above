import crypto from 'crypto';
import { users, appointments } from './data.js';
import { Appointment, PasswordResetToken, User } from '../models/index.js';
import logger from './logger/index.js';
import { sequelize } from './db.js';

export const seedUsers = async () => {
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

async function main() {
  seedTokens();
  try {
    await sequelize.authenticate();
    logger.info('Connected to the database');
    logger.info('Starting to seed users');
    await seedUsers(); // No transaction
    logger.info('Users seeded successfully');
  } catch (error) {
    logger.error('An error occurred while seeding the database:', error);
  } finally {
    try {
      await sequelize.close();
      logger.info('Database connection closed');
    } catch (closeError) {
      logger.error('Error closing the database connection:', closeError);
    }
  }
}

main().catch((err) => {
  logger.error('An error occurred while attempting to seed the database:', err);
});
