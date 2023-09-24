const app = require('./app'); // the actual Express application
const http = require('http');

const logger = require('./utils/logger');

const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
