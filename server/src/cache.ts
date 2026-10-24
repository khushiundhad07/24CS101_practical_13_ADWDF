import NodeCache from 'node-cache';

/**
 * One in-memory cache for this process. Entries expire after CACHE_TTL seconds (default 60).
 * useClones: false — cached values are plain objects from .lean() that are never mutated, so
 * deep-copying 2,000 tasks on every get/set would only waste time.
 */
export const cache = new NodeCache({
  stdTTL: Number(process.env.CACHE_TTL ?? 60),
  checkperiod: 120,
  useClones: false,
});

// Stable keys. Tasks belong to a user (Practical 7), so each user's data is cached separately.
export const keys = {
  allTasks: (userId: string) => `all_tasks:${userId}`,
  task: (userId: string, taskId: string) => `task:${userId}:${taskId}`,
};

type Route = 'list' | 'single';

/** Hit / miss counts per cached route, exposed by GET /debug/cache. */
export const stats = {
  list: { hits: 0, misses: 0 },
  single: { hits: 0, misses: 0 },
};

/** Lets the cache be switched off at runtime to measure uncached times (instead of editing code). */
export const settings = { enabled: true };

/** Reads through the cache: returns the cached value, or loads, stores and returns a fresh one. */
export async function cached<T>(route: Route, key: string, load: () => Promise<T>): Promise<{ value: T; hit: boolean }> {
  if (settings.enabled) {
    const hit = cache.get<T>(key);
    if (hit !== undefined) {
      stats[route].hits++;
      return { value: hit, hit: true };
    }
  }
  stats[route].misses++;
  const value = await load();
  // Don't cache "not found" — a task created later with that id must not be hidden.
  if (settings.enabled && value !== null) cache.set(key, value);
  return { value, hit: false };
}

/** Drops everything cached for one user's tasks (called after every successful write). */
export function invalidateTasks(userId: string, taskId?: string) {
  cache.del(keys.allTasks(userId));
  if (taskId) cache.del(keys.task(userId, taskId));
}
