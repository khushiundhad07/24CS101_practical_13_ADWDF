import express from 'express';
import cors from 'cors';
import { logger } from './middleware/logger';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import taskRoutes from './routes/tasks';
import authRoutes from './routes/auth';
import debugRoutes from './routes/debug';
import eventRoutes from './routes/events';
import aiRoutes from './routes/ai';
import { db } from './db';
import { registerListeners } from './events/listeners';

/** Closes this practical's MongoDB connection (used by tests and scripts). */
export const closeDb = () => db.close();

/** Builds the app without listening, so server.ts and the combined repo server can both use it. */
export function createApp() {
  // Listeners must be registered before the first event is emitted.
  registerListeners();

  const app = express();

  // Pipeline: CORS → parse JSON → log → routes → 404 → error handler.
  // CORS lets the React dev server (localhost:5173) call this API on localhost:5000.
  // X-Cache is exposed so a browser on another origin can read HIT / MISS.
  app.use(cors({ exposedHeaders: ['X-Cache'] }));
  app.use(express.json());
  app.use(logger);

  app.get('/', (_req, res) => {
    res.json({ name: 'Task Management API', practical: 13 });
  });

  app.use('/auth', authRoutes);
  app.use('/tasks', taskRoutes);
  app.use('/debug', debugRoutes);
  app.use('/events', eventRoutes);
  app.use('/api/ai', aiRoutes);

  // Demonstrates the error handler: anything passed to next(err) ends up there.
  app.get('/boom', (_req, _res, next) => {
    next(new Error('Deliberate test error'));
  });

  // No route matched.
  app.use(notFound);
  // Last: the global error handler.
  app.use(errorHandler);
  return app;
}
