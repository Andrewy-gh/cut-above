import cron from 'node-cron';
import { deleteExpiredTokens } from '../services/resetTokenService.js';

export default function cronJob() {
  cron.schedule('0 0 0 * * *', async () => {
    await deleteExpiredTokens();
  });
}
