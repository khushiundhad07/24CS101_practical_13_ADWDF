import type { RequestHandler } from 'express';

const WINDOW_MS = 60_000;

/** Last AI request time per user + task title. In memory, like the Practical 9 cache. */
const lastRequest = new Map<string, number>();

/**
 * At most one AI request per task (identified by its title) per user per minute.
 * Keeps a whole lab batch clicking "Generate" from burning through the API quota.
 */
export const aiRateLimit: RequestHandler = (req, res, next) => {
  const key = `${req.user!.id}:${String(req.body.title).trim().toLowerCase()}`;
  const now = Date.now();
  const last = lastRequest.get(key);

  if (last !== undefined && now - last < WINDOW_MS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - last)) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ error: `You already asked for this task — try again in ${retryAfter} s.`, retryAfter });
  }

  lastRequest.set(key, now);
  // Forget old entries so the map can't grow without limit.
  for (const [k, t] of lastRequest) if (now - t >= WINDOW_MS) lastRequest.delete(k);
  next();
};
