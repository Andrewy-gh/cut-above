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
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log('ERR MIDDLEWARE MESSAGE', err);
      console.log('===========================');
      return res.sendStatus(403); //invalid token
    }
    req.user = decoded.id;
    next();
  });
};

module.exports = { requestLogger, verifyJWT };
