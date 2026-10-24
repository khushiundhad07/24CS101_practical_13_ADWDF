import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';

/** Route-specific middleware: :id must be a valid MongoDB ObjectId before any query runs. */
export const validateId: RequestHandler = (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: `Invalid task id "${req.params.id}" — expected a 24-character ObjectId` });
  }
  next();
};
