import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/index.js';
import { sequelize } from '../utils/db.js';
import { applyDbContext, type DbRole } from '../utils/dbContext.js';

const authEmailPaths = new Set(['/api/auth/login', '/api/email/reset-pw']);

const getAuthEmail = (req: Request) => {
  if (!authEmailPaths.has(req.path)) return null;
  return typeof req.body?.email === 'string' ? req.body.email : null;
};

const getAuthUserIdFromPath = (path: string) => {
  const match = path.match(/^\/api\/auth\/(?:validation|reset-pw)\/([^/]+)/);
  return match?.[1] ?? null;
};

const waitForResponse = (res: Response) =>
  new Promise<void>((resolve, reject) => {
    res.once('finish', () => resolve());
    res.once('close', () => resolve());
    res.once('error', reject);
  });

const dbContext = async (req: Request, res: Response, next: NextFunction) =>
  req.path.startsWith('/api/') && req.method !== 'OPTIONS'
    ? sequelize
        .transaction(async (transaction) => {
          const userId = req.session?.userId ?? null;
          const authEmail = getAuthEmail(req);
          const authUserId = getAuthUserIdFromPath(req.path);
          const isAdmin = Boolean(req.session?.isAdmin);
          const sessionRole = req.session?.userRole;

          let role: DbRole = 'public';
          if (isAdmin) role = 'admin';
          else if (sessionRole) role = sessionRole;
          else if (userId) role = 'public';

          await applyDbContext(
            {
              role,
              userId,
              authEmail,
              authUserId,
            },
            { transaction }
          );

          if (userId && !sessionRole && !isAdmin) {
            const user = await User.findByPk(userId, { transaction });
            if (user?.role) {
              role = user.role;
              req.session.userRole = role;
              req.session.isAdmin = role === 'admin';
              await applyDbContext(
                {
                  role,
                  userId,
                  authEmail,
                  authUserId,
                },
                { transaction }
              );
            }
          }

          next();
          await waitForResponse(res);
        })
        .catch(next)
    : next();

export default dbContext;
