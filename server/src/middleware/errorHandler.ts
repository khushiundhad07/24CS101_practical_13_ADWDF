import type { ErrorRequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';

/**
 * Global error handler — registered last, after every route.
 * Mongoose validation and cast errors become structured 400 responses; anything else is a 500
 * whose stack trace stays in the server log.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof MongooseError.ValidationError) {
    const fields = Object.fromEntries(Object.entries(err.errors).map(([path, e]) => [path, e.message]));
    return res.status(400).json({ error: 'Validation failed', fields });
  }
  if (err instanceof MongooseError.CastError) {
    return res.status(400).json({ error: `Invalid value for ${err.path}`, value: err.value });
  }
  // express.json() sets status 400 on malformed JSON bodies.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }

  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
};
