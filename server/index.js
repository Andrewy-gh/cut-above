import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import 'express-async-errors';
import { PORT } from './utils/config.js';
import { connectToDatabase } from './utils/db.js';
import router from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import logger from './utils/logger/index.js';
import session from './middlewares/session.js';
import cors from './middlewares/cors.js';
import cronJob from './utils/cronJob.js';
import limiter from './middlewares/limiter.js';
import setCSPHeader from './middlewares/contentSecurity.js';
import { listenForMessage } from './services/emailService.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(setCSPHeader);
app.use(bodyParser.json());
app.use(express.static('dist'));

app.set('trust proxy', 1);

// setup CORS logic
app.options('*', cors);
app.use(cors);

// session config
app.use(session);

// rate limiter middleware
app.use(limiter);

// automatic cron job
cronJob();

// pub/sub message listener
listenForMessage();

// routes
app.use(router);

// error handler middleware
app.use(errorHandler);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    logger.info(`Server running on ${PORT}`);
  });
};

start();
