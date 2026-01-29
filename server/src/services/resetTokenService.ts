import { PasswordResetToken } from '../models/index.js';
import { Op } from 'sequelize';
import { Result } from 'better-result';
import { DatabaseError } from '../errors.js';

export const deleteExpiredTokens = async () =>
  Result.tryPromise({
    try: () =>
      PasswordResetToken.destroy({
        where: {
          expiresAt: {
            [Op.lt]: new Date().toISOString(),
          },
        },
      }).then(() => undefined),
    catch: (cause) =>
      new DatabaseError({
        statusCode: 500,
        message:
          cause instanceof Error
            ? cause.message
            : 'Failed to delete expired tokens',
      }),
  });
