require('dotenv').config();

const CLIENT_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_CLIENT_URL
    : process.env.PROD_CLIENT_URL;
const EMAIL_SERVICE =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_EMAIL_SERVICE
    : process.env.EMAIL_SERVICE;
const EMAIL_USER =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_EMAIL_USER
    : process.env.EMAIL_USER;
const EMAIL_PASSWORD =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_EMAIL_PASSWORD
    : process.env.EMAIL_PASSWORD;
const PORT =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_PORT
    : process.env.PORT;

module.exports = {
  CLIENT_URL,
  EMAIL_SERVICE,
  EMAIL_USER,
  EMAIL_PASSWORD,
  PORT,
};
