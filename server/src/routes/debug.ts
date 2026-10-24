import { Router } from 'express';
import { auth } from '../middleware/auth';
import { requireJson } from '../middleware/requireJson';
import { cache, invalidateTasks, settings, stats } from '../cache';
import { Task } from '../models/Task';

const router = Router();
router.use(auth);

const snapshot = () => {
  const s = cache.getStats();
  const rate = (h: number, m: number) => (h + m === 0 ? null : Math.round((h / (h + m)) * 100));
  return {
    enabled: settings.enabled,
    ttlSeconds: cache.options.stdTTL,
    keys: s.keys,
    routes: {
      'GET /tasks': { ...stats.list, hitRate: rate(stats.list.hits, stats.list.misses) },
      'GET /tasks/:id': { ...stats.single, hitRate: rate(stats.single.hits, stats.single.misses) },
    },
  };
};

// GET /debug/cache → hit / miss counters, keys and TTL
router.get('/cache', (_req, res) => {
  res.json(snapshot());
});

// PUT /debug/cache {"enabled": false} → switch caching off (and clear it) to measure uncached times
router.put('/cache', requireJson, (req, res) => {
  if (typeof req.body?.enabled !== 'boolean') return res.status(400).json({ error: 'enabled must be a boolean' });
  settings.enabled = req.body.enabled;
  cache.flushAll();
  res.json(snapshot());
});

// DELETE /debug/cache → clear all entries and reset the counters
router.delete('/cache', (_req, res) => {
  cache.flushAll();
  for (const r of Object.values(stats)) Object.assign(r, { hits: 0, misses: 0 });
  res.json(snapshot());
});

// POST /debug/seed {"count": 500} → add sample tasks for the logged-in user so timings are measurable
router.post('/seed', requireJson, async (req, res, next) => {
  try {
    const count = Math.min(Math.max(Number(req.body?.count) || 0, 1), 2000);
    const docs = Array.from({ length: count }, (_, i) => ({
      owner: req.user!.id,
      title: `Sample task ${i + 1}`,
      description: 'Seeded to make the database read measurable.',
      priority: (['low', 'medium', 'high'] as const)[i % 3],
    }));
    await Task.insertMany(docs);
    invalidateTasks(req.user!.id);
    res.status(201).json({ added: count, total: await Task.countDocuments({ owner: req.user!.id }) });
  } catch (err) {
    next(err);
  }
});

export default router;
