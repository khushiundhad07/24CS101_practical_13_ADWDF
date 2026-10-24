import type { RequestHandler } from 'express';

/** Rejects POST/PUT requests that don't declare a JSON body, before they reach a controller. */
export const requireJson: RequestHandler = (req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') && !req.is('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }
  next();
};
