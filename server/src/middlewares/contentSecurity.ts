import { Request, Response, NextFunction } from 'express';

export default function setCSPHeader(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  res.setHeader(
    'Content-Security-Policy',
    "img-src 'self' https://res.cloudinary.com"
  );
  next();
}
