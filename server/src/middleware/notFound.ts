import type { RequestHandler } from 'express';

/** Runs only when no route matched: a structured JSON 404 instead of Express's HTML page. */
export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ error: 'Route not found', method: req.method, path: req.originalUrl });
};
