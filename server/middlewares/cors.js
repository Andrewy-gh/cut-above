import cors from 'cors';

const allowedOrigins = [
  'https://cutaboveshop.fly.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error(`${origin}: Not allowed by CORS`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default (() => cors(corsOptions))();
