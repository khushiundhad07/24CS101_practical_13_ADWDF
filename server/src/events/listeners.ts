import { record, taskEvents, type TaskEventPayload } from './events';

/** Simulated slow notification work (e.g. sending an email). Override with NOTIFY_DELAY_MS. */
const delayMs = () => Number(process.env.NOTIFY_DELAY_MS ?? 2000);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Registers the background listeners. Called once from createApp() so the `.on()` calls run at
 * startup — before any event can be emitted.
 */
let registered = false;

export function registerListeners() {
  if (registered) return;
  registered = true;

  // emit() runs listeners synchronously, inside the route handler. Each listener therefore starts
  // with `await` (a timer), which returns control to the event loop at once: the handler finishes,
  // the response is sent, and the notification work continues later.
  taskEvents.on('task-created', async (payload) => {
    try {
      await wait(delayMs());
      // Demo hook for the error listener: a title containing "[fail]" makes the notification fail.
      if (payload.task.title.includes('[fail]')) throw new Error(`Notification service rejected "${payload.task.title}"`);

      const handledAt = new Date().toISOString();
      console.log(`[Notification] Task "${payload.task.title}" created by ${payload.user} at ${handledAt} (API responded at ${payload.respondedAt})`);
      record({ event: 'task-created', title: payload.task.title, user: payload.user, respondedAt: payload.respondedAt, handledAt, status: 'ok', message: 'New task notification sent' });
    } catch (err) {
      // Errors in a listener must not escape — there is no request left to send them to.
      taskEvents.emit('error', Object.assign(err as Error, { payload }));
    }
  });

  taskEvents.on('task-deleted', async (payload) => {
    await wait(delayMs() / 4);
    const handledAt = new Date().toISOString();
    console.log(`[Notification] Task "${payload.task.title}" was deleted by ${payload.user} at ${handledAt}`);
    record({ event: 'task-deleted', title: payload.task.title, user: payload.user, respondedAt: payload.respondedAt, handledAt, status: 'ok', message: 'Deletion recorded' });
  });

  // Catches and logs errors thrown inside the task-created handler. Without a listener for
  // 'error', emitting it would throw and crash the whole server.
  taskEvents.on('error', (err: Error & { payload?: TaskEventPayload }) => {
    const handledAt = new Date().toISOString();
    console.error(`[Notification error] ${err.message} at ${handledAt}`);
    if (err.payload) {
      const p = err.payload;
      record({ event: 'task-created', title: p.task.title, user: p.user, respondedAt: p.respondedAt, handledAt, status: 'error', message: err.message });
    }
  });
}
