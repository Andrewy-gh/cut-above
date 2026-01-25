import express, { type Express } from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import 'express-async-errors';
import router from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import session from './middlewares/session.js';
import cors from './middlewares/cors.js';
import limiter from './middlewares/limiter.js';
import setCSPHeader from './middlewares/contentSecurity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

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

// routes
app.use(router);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.use(errorHandler);

export default app;
