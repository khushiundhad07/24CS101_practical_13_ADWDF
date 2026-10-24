import type { RequestHandler } from 'express';

/** Logs method, URL and timestamp for every request, then hands over with next(). */
export const logger: RequestHandler = (req, _res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
};
