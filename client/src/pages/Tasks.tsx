import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import TaskForm from '../components/tasks/TaskForm';
import TaskItem from '../components/tasks/TaskItem';
import Delayed from '../components/Delayed';
import * as api from '../api';
import type { Task, TaskInput } from '../api';

// Chart.js is ~170 kB. It is only downloaded when someone opens the charts, not with the page.
const TaskInsights = lazy(() => import('../components/tasks/TaskInsights'));

/** A task shown before the server has confirmed it (optimistic create). */
export type ListTask = Task & { pending?: boolean };

export default function Tasks() {
  const [tasks, setTasks] = useState<ListTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Task | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const confirmResolver = useRef<(ok: boolean) => void>();
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await api.getTasks());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tasks always come from the database on mount — nothing is hardcoded.
  useEffect(() => {
    load();
  }, [load]);

  // Optimistic create: the task appears at once, marked pending, and is swapped for the
  // server's document when it answers — or removed again if the server rejects it.
  const create = async (input: TaskInput) => {
    const tempId = `temp-${Date.now()}`;
    const temp: ListTask = {
      _id: tempId,
      title: input.title?.trim() ?? '',
      description: input.description ?? '',
      completed: false,
      priority: input.priority ?? 'medium',
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setTasks((prev) => [temp, ...prev]);
    try {
      const created = await api.createTask(input);
      setTasks((prev) => prev.map((t) => (t._id === tempId ? created : t)));
      toast('success', `Added “${created.title}”`);
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      toast('error', `Couldn’t add the task: ${(err as Error).message}`);
      throw err;
    }
  };

  // Updates and deletes wait for the server, then use its response.
  // useCallback keeps these functions identical between renders, so the memoised
  // TaskItem rows only re-render when their own task changes.
  const update = useCallback(async (id: string, input: TaskInput) => {
    try {
      const updated = await api.updateTask(id, input);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      toast('success', input.completed === undefined ? 'Task saved' : updated.completed ? 'Marked as done' : 'Marked as open');
    } catch (err) {
      toast('error', `Couldn’t save: ${(err as Error).message}`);
      throw err;
    }
  }, [toast]);

  const askToDelete = useCallback(
    (task: Task) =>
      new Promise<boolean>((resolve) => {
        confirmResolver.current = resolve;
        setToDelete(task);
      }),
    [],
  );

  const closeConfirm = (ok: boolean) => {
    setToDelete(null);
    confirmResolver.current?.(ok);
  };

  const remove = useCallback(async (task: Task) => {
    if (!(await askToDelete(task))) return;
    try {
      await api.deleteTask(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      toast('success', `Deleted “${task.title}”`);
    } catch (err) {
      toast('error', `Couldn’t delete: ${(err as Error).message}`);
      throw err;
    }
  }, [askToDelete, toast]);

  const open = tasks.filter((t) => !t.completed).length;

  return (
    <section className="py-14">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">Full stack · React → Express → MongoDB</p>
      <h1 className="mt-3 font-serif text-5xl font-medium tracking-tight">Tasks</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Everything here is stored in MongoDB through the Express API — refresh the page and it is all still here.
      </p>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <TaskForm onCreate={create} />

        <div className="rounded-2xl border border-line bg-paper-raised">
          <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">
              {loading ? 'Loading' : `${open} open · ${tasks.length - open} done`}
            </h2>
            <button type="button" onClick={load} className="text-[13px] text-ink-mute hover:text-ink">
              Refresh
            </button>
          </header>
          {loading ? (
            <div className="px-5">
              <Spinner label="Loading tasks…" />
            </div>
          ) : error ? (
            <div className="p-5">
              <ErrorMessage message={error} onRetry={load} />
            </div>
          ) : tasks.length === 0 ? (
            <p className="px-5 py-10 text-ink-mute">No tasks yet — add the first one.</p>
          ) : (
            <ul className="divide-y divide-line">
              {tasks.map((t) => (
                <TaskItem key={t._id} task={t} pending={t.pending} onUpdate={update} onDelete={remove} />
              ))}
            </ul>
          )}
        </div>
      </div>

      {!loading && !error && tasks.length > 0 && (
        <div className="mt-6 rounded-2xl border border-line bg-paper-raised">
          <header className="flex items-center justify-between px-5 py-3.5">
            <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">Insights</h2>
            <button
              type="button"
              onClick={() => setShowInsights((v) => !v)}
              aria-expanded={showInsights}
              className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink-soft hover:border-ink-mute hover:text-ink"
            >
              {showInsights ? 'Hide charts' : 'Show charts'}
            </button>
          </header>
          {showInsights && (
            <div className="border-t border-line">
              <Suspense
                fallback={
                  <Delayed>
                    <div className="px-5">
                      <Spinner label="Loading charts…" />
                    </div>
                  </Delayed>
                }
              >
                <TaskInsights tasks={tasks} />
              </Suspense>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this task?"
        message={toDelete ? `“${toDelete.title}” will be removed from the database. This can’t be undone.` : ''}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
    </section>
  );
}
