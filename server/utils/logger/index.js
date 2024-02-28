import buildDevLogger from './devLogger.js';
import buildProdLogger from './prodLogger.js';

let logger = null;
if (process.env.NODE_ENV === 'development') {
  logger = buildDevLogger();
} else {
  logger = buildProdLogger();
}

export default logger;
