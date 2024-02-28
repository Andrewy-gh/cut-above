import { Sequelize } from 'sequelize';
import { DATABASE_URL } from './config.js';
import logger from './logger/index.js';

export const sequelize = new Sequelize(DATABASE_URL);

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('connected to the database');
  } catch (error) {
    logger.error('failed to connect to database', error);
  }
  return null;
};
