import cron from 'node-cron';
import { deleteExpiredTokens } from '../services/resetTokenService.js';
import logger from './logger/index.js';

export default function cronJob() {
  cron.schedule('0 0 0 * * *', async () => {
    const result = await deleteExpiredTokens();
    if (result.status === 'error') {
      logger.error('Failed to delete expired tokens');
      logger.error(result.error);
    }
  });
}
