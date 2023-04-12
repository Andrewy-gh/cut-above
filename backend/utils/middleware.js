const jwt = require('jsonwebtoken');
const logger = require('./logger');

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method);
  logger.info('Path:  ', req.path);
  logger.info('Body:  ', req.body);
  logger.info('---');
  next();
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('verification error');
    return res.sendStatus(401);
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403); //invalid token
    }
    console.log('user extracted');
    req.user = decoded.id;
    next();
  });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.name);
  logger.error(error.message);
  response.status(500).send(error.message);
  next(error);
};

module.exports = { errorHandler, requestLogger, verifyJWT };
