const app = require('./app'); // the actual Express application
const http = require('http');
const config = require('./config/config');

const logger = require('./utils/logger');

const server = http.createServer(app);
const port = config.PORT || 3000;
server.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
