import cors from 'cors';

const allowedOrigins = [
  'https://cutaboveshop.fly.dev',
  'http://localhost:3000',
  'http://localhost:5173',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const isDevOrTest = process.env.NODE_ENV !== 'production';
    if (!origin) {
      if (isDevOrTest) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin required for CORS'));
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`${origin}: Not allowed by CORS`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default (() => cors(corsOptions))();
