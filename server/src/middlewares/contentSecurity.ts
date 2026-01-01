import { Request, Response, NextFunction } from 'express';

export default function setCSPHeader(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.setHeader(
    'Content-Security-Policy',
    "img-src 'self' https://res.cloudinary.com"
  );
  next();
}
