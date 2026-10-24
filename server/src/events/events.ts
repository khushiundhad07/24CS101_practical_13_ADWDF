import { EventEmitter } from 'node:events';

export interface TaskEventPayload {
  task: { _id: string; title: string; priority: string };
  /** Email of the user who made the change. */
  user: string;
  /** When the API sent its response, so listeners can show the ordering. */
  respondedAt: string;
}

/** Typed event names and payloads for the task event bus. */
interface TaskEventMap {
  'task-created': [TaskEventPayload];
  'task-deleted': [TaskEventPayload];
  // 'error' is special in EventEmitter: emitting it with no listener throws and crashes the process.
  error: [Error];
}

/** One shared emitter for task events — Node's built-in module, no queue infrastructure. */
class TaskEvents extends EventEmitter<TaskEventMap> {}

export const taskEvents = new TaskEvents();

/** One handled notification, kept so the client can show the timeline. */
export interface NotificationEntry {
  id: number;
  event: 'task-created' | 'task-deleted';
  title: string;
  user: string;
  respondedAt: string;
  handledAt: string;
  status: 'ok' | 'error';
  message: string;
}

const MAX_ENTRIES = 50;
let nextId = 1;

/** The last 50 notifications, newest first. In memory only, like the console log it mirrors. */
export const notificationLog: NotificationEntry[] = [];

export function record(entry: Omit<NotificationEntry, 'id'>) {
  notificationLog.unshift({ id: nextId++, ...entry });
  notificationLog.length = Math.min(notificationLog.length, MAX_ENTRIES);
}
