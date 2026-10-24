import type { RequestHandler } from 'express';
import { Task } from '../models/Task';
import { cached, invalidateTasks, keys } from '../cache';
import { taskEvents } from '../events/events';

// Every route here runs after `auth`, so req.user is set, and after `validate`, so req.body
// only holds checked fields. Each query is scoped to the logged-in user's own tasks.
// Database failures go to the global error handler with next(err).

const owner = (req: Parameters<RequestHandler>[0]) => req.user!.id;
const notFound = (id: string) => ({ error: `Task ${id} not found` });

// GET /tasks → 200, from the cache when possible
export const getAllTasks: RequestHandler = async (req, res, next) => {
  try {
    const { value: tasks, hit } = await cached('list', keys.allTasks(owner(req)), () =>
      Task.find({ owner: owner(req) }).sort({ createdAt: -1 }).lean(),
    );
    res.set('X-Cache', hit ? 'HIT' : 'MISS');
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// GET /tasks/:id → 200, or 404; cached separately from the list
export const getTask: RequestHandler = async (req, res, next) => {
  try {
    const { value: task, hit } = await cached('single', keys.task(owner(req), req.params.id), () =>
      Task.findOne({ _id: req.params.id, owner: owner(req) }).lean(),
    );
    res.set('X-Cache', hit ? 'HIT' : 'MISS');
    if (!task) return res.status(404).json(notFound(req.params.id));
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// POST /tasks → 201
export const createTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, owner: owner(req) });
    invalidateTasks(owner(req));

    // Respond first…
    const respondedAt = new Date().toISOString();
    console.log(`[API] Response sent at ${respondedAt}`);
    res.status(201).json(task);

    // …then announce the event. The notification is handled by a listener, not by this route.
    taskEvents.emit('task-created', {
      task: { _id: task._id.toString(), title: task.title, priority: task.priority },
      user: req.user!.email,
      respondedAt,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /tasks/:id → 200, or 404
export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: owner(req) }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json(notFound(req.params.id));
    invalidateTasks(owner(req), req.params.id);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// DELETE /tasks/:id → 200 with the removed task, or 404
export const deleteTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: owner(req) });
    if (!task) return res.status(404).json(notFound(req.params.id));
    invalidateTasks(owner(req), req.params.id);

    const respondedAt = new Date().toISOString();
    res.status(200).json({ message: 'Task deleted', task });
    taskEvents.emit('task-deleted', {
      task: { _id: task._id.toString(), title: task.title, priority: task.priority },
      user: req.user!.email,
      respondedAt,
    });
  } catch (err) {
    next(err);
  }
};
