import { sequelize } from './db.js';
import logger from './logger/index.js';
import '../models/index.js';

const resetDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to the database');
    
    await sequelize.sync({ force: true });
    logger.info('All tables dropped and recreated successfully');
    
    return true;
  } catch (error) {
    logger.error('Error resetting database:', error);
    throw error;
  }
};

async function main() {
  try {
    logger.info('Starting database reset...');
    await resetDatabase();
    logger.info('Database reset completed successfully');
  } catch (error) {
    logger.error('An error occurred while resetting the database:', error);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
      logger.info('Database connection closed');
    } catch (closeError) {
      logger.error('Error closing the database connection:', closeError);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    logger.error('An error occurred while attempting to reset the database:', err);
    process.exit(1);
  });
}
