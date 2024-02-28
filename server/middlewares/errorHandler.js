import ApiError from '../utils/ApiError.js';
import { isCelebrateError } from 'celebrate';
import logger from '../utils/logger/index.js';

const errorHandler = async (err, req, res, next) => {
  logger.error('====================================');
  logger.error(err);
  logger.error('====================================');
  if (isCelebrateError(err)) {
    // how to extract Celebrate Error details: https://stackoverflow.com/a/56865784
    const segments = ['body', 'params'];
    const errorMessages = [];
    for (const segment of segments) {
      const error = err.details.get(segment);
      if (error) {
        const {
          details: [errorDetails],
        } = error; // 'details' is a Map()
        // prevents regex pattern from being sent to client
        if (errorDetails.path.includes('password')) {
          errorMessages.push('Password does not meet requirements');
        } else {
          errorMessages.push(errorDetails.message);
        }
      }
    }
    logger.error(errorMessages.join(', '));
    return res.status(400).json({ error: errorMessages.join(', ') });
  }
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // Handles sequelize validation errors
  if (err.errors) {
    const errorMessage = err?.errors.map((error) => error.message).join(', ');
    res.status(400).json({ error: errorMessage });
  }
  return res.status(500).json({ error: err.message });
};

export default errorHandler;
