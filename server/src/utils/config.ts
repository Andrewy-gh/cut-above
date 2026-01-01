import 'dotenv/config';

export const DATABASE_URL: string | undefined =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_DATABASE_URL
    : process.env.DATABASE_URL;

export const PORT: string | undefined =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_PORT
    : process.env.PROD_PORT;

export const REDIS_URL: string | undefined = process.env.REDIS_URL;

export const SESSION_SECRET: string | undefined = process.env.SESSION_SECRET;

export const CLIENT_URL: string | undefined =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_CLIENT_URL
    : process.env.PROD_CLIENT_URL;

export const EMAIL_SERVICE: string | undefined =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_EMAIL_SERVICE
    : process.env.EMAIL_SERVICE;

export const EMAIL_USER: string | undefined =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_EMAIL_USER
    : process.env.EMAIL_USER;

export const EMAIL_PASSWORD: string | undefined =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_EMAIL_PASSWORD
    : process.env.EMAIL_PASSWORD;
