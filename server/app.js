require('dotenv').config();
const express = require('express');
require('express-async-errors');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const corsOptions = require('./config/corsOptions');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });
app.use(cors(corsOptions));
app.use(express.static('dist'));
app.use(express.json());
app.use(cookieParser());

app.use(middleware.requestLogger);
app.use('/api/employee', require('./routes/employee'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/appointment', require('./routes/appointment'));
app.use('/auth', require('./routes/auth'));
app.use('/logout', require('./routes/logout'));
app.use('/refresh', require('./routes/refreshToken'));
app.use('/signup', require('./routes/register'));
app.use('/api/email', require('./routes/email'));
app.use('/api/user', require('./routes/user'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.use(middleware.errorHandler);

module.exports = app;
