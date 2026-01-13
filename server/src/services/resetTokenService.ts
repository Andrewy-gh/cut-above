import { PasswordResetToken } from '../models/index.js';
import { Op } from 'sequelize';

export const deleteExpiredTokens = async (): Promise<void> => {
  await PasswordResetToken.destroy({
    where: {
      expiresAt: {
        [Op.lt]: new Date().toISOString(),
      },
    },
  });
};
