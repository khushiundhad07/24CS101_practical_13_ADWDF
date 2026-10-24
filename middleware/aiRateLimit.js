// Simple in-memory rate limiter for the AI route: per user, per minute.
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = Number(process.env.AI_RATE_LIMIT) || 5;

const hits = new Map(); // userId -> array of request timestamps

const aiRateLimit = (req, res, next) => {
  const key = req.user ? req.user.id : req.ip;
  const now = Date.now();

  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({
      message: `Too many AI requests. Try again in ${retryAfter} s.`
    });
  }

  recent.push(now);
  hits.set(key, recent);
  next();
};

aiRateLimit.reset = () => hits.clear();

module.exports = aiRateLimit;
