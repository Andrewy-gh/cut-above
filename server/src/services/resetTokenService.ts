import { PasswordResetToken } from '../models/index.js';
import { Op } from 'sequelize';
import { tryDb } from '../utils/dbResult.js';

export const deleteExpiredTokens = async () =>
  tryDb({
    try: () =>
      PasswordResetToken.destroy({
        where: {
          expiresAt: {
            [Op.lt]: new Date().toISOString(),
          },
        },
      }).then(() => undefined),
    message: 'Failed to delete expired tokens',
  });
