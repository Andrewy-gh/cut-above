export default function setCSPHeader(req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    "img-src 'self' https://res.cloudinary.com"
  );
  next();
}
