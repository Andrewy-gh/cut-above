import cors from 'cors';

const allowedOrigins = [
  'https://cutaboveshop.fly.dev',
  'http://localhost:3000',
  'http://localhost:5173',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin as string) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error(`${origin}: Not allowed by CORS`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default (() => cors(corsOptions))();
