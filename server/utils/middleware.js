const logger = require('./logger');
const jwt = require('jsonwebtoken');
const AppError = require('./AppError');
const databaseServices = require('./database');

const requestLogger = (req, res, next) => {
  // prevents logging of user information
  if (req.path !== '/auth') {
    logger.info('Method:', req.method);
    logger.info('Path:  ', req.path);
    logger.info('Body:  ', req.body);
    logger.info('---');
  }
  next();
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ') && !req.body.emailToken) {
    // return res.sendStatus(401);
    throw new AppError(401, 'Unauthorized');
  }
  const token = authHeader ? authHeader.split(' ')[1] : req.body.emailToken;
  let secret;
  let source;
  if (req.path === '/api/user/resetpw') {
    source = 'reset';
    secret = process.env.RESET_TOKEN_SECRET;
  } else if (req.body.emailToken) {
    source = 'email';
    secret = process.env.EMAIL_TOKEN_SECRET;
  } else {
    source = 'access';
    secret = process.env.ACCESS_TOKEN_SECRET;
  }
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    decoded = jwt.decode(token);
    req.decoded = decoded.id;
    next(err);
  }
  if (source === 'reset' || source === 'email') {
    req.emailId = decoded.id;
    next();
  }
  if (source === 'access') {
    req.user = decoded.id;
    next();
  }
  // jwt.verify(token, secret, (err, decoded) => {
  //   if (err) {
  //     // return res.sendStatus(403); //invalid token
  //     next(err);
  //   }
  //   // reset and email decodes into user's emailToken
  //   req.user = decoded.id;
  //   next();
  // });
};

const handleEmailTokenError = (err, req, res, next) => {
  if (err) {
    databaseServices.removeEmailToken(req.decoded);
    next(err);
  }
  next();
};

const errorHandler = async (err, req, res, next) => {
  logger.error(err.name);
  logger.error(err.message);
  // Check if there is an active session
  if (req.session) {
    // Abort any open transactions
    await req.session.abortTransaction();
    // End the session
    await req.session.endSession();
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'invalid token',
    });
  } else if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'token expired',
    });
  } else if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: err.message });
};

module.exports = {
  errorHandler,
  requestLogger,
  verifyJWT,
  handleEmailTokenError,
};
