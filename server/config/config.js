require('dotenv').config();

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

module.exports = {
  EMAIL_SERVICE,
  EMAIL_USER,
  EMAIL_PASSWORD,
};
