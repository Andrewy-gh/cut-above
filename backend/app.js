const config = require('./utils/config');
const express = require('express');
require('express-async-errors');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');
const appointmentRouter = require('./controllers/appointment');
const authRouter = require('./controllers/auth');
const employeeRouter = require('./controllers/employee');
const logoutRouter = require('./controllers/logout');
const refreshRouter = require('./controllers/refresh');
const scheduleRouter = require('./controllers/schedule');

logger.info('connecting to', config.MONGODB_URI);
mongoose.set('strictQuery', false);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.static('build'));
app.use(express.json());
app.use(cookieParser());
app.use(middleware.requestLogger);

app.use('/auth', authRouter);
app.use('/logout', logoutRouter);
app.use('/refresh', refreshRouter);
app.use('/employee', employeeRouter);
app.use('/schedule', scheduleRouter);
app.use(middleware.verifyJWT);
app.use('/appointment', appointmentRouter);

app.use(middleware.errorHandler);

module.exports = app;
