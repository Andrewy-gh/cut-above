import { Request, Response, NextFunction } from 'express';
import * as v from 'valibot';

type ValidationTarget = 'body' | 'params' | 'query';

interface ValidationConfig {
  body?: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
  params?: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
  query?: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
}

export const validate = (config: ValidationConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targets: ValidationTarget[] = ['body', 'params', 'query'];

      for (const target of targets) {
        const schema = config[target];
        if (schema) {
          req[target] = v.parse(schema, req[target]);
        }
      }

      next();
    } catch (error) {
      if (error instanceof v.ValiError) {
        const errors = error.issues.map(issue => {
          const path = issue.path?.map((item: { key: string | number | symbol }) => String(item.key)).join('.') || 'unknown';
          return {
            path,
            message: issue.message,
          };
        });

        // Include first error message in error field for clarity
        const errorMessage = errors.length > 0
          ? errors[0].message
          : 'Validation Error';

        res.status(400).json({
          error: errorMessage,
          details: errors,
        });
        return;
      }

      next(error);
    }
  };
};
