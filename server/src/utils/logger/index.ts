import { Logger } from 'winston';
import buildDevLogger from './devLogger.js';
import buildProdLogger from './prodLogger.js';

let logger: Logger;
if (process.env.NODE_ENV === 'development') {
  logger = buildDevLogger();
} else {
  logger = buildProdLogger();
}

export default logger;
