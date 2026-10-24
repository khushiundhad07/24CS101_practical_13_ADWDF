import type { RequestHandler } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { jwtSecret } from '../config';

/**
 * Verifies `Authorization: Bearer <token>` and puts the decoded user on req.user.
 * Any problem with the token is a 401 — jwt.verify() throws, so it is wrapped in try/catch
 * rather than being allowed to crash the request.
 */
export const auth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : undefined;
  if (!token) {
    return res.status(401).json({ error: 'Missing token — send the header Authorization: Bearer <token>' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret()) as JwtPayload & { id: string; email: string };
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    const message = err instanceof jwt.TokenExpiredError ? 'Token expired — log in again' : 'Invalid token';
    res.status(401).json({ error: message });
  }
};
