import app from './app.js';
import { PORT } from './utils/config.js';
import { connectToDatabase } from './utils/db.js';
import logger from './utils/logger/index.js';

const start = async () => {
  if (!PORT) {
    throw new Error('PORT must be defined in environment variables');
  }
  await connectToDatabase();
  app.listen(Number(PORT), '0.0.0.0', () => {
    logger.info(`Server running on 0.0.0.0:${PORT}`);
  });
};

start();
