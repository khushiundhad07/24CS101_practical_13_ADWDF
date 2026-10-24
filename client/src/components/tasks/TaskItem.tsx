import { memo, useState } from 'react';
import { PRIORITIES, type Priority, type Task, type TaskInput } from '../../api';

interface TaskItemProps {
  task: Task;
  /** Shown optimistically, not yet confirmed by the server: no actions until it is. */
  pending?: boolean;
  onUpdate: (id: string, input: TaskInput) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
}

/** One task row. Keeps its own busy/error state so each action reports independently. */
function TaskItem({ task, pending = false, onUpdate, onDelete }: TaskItemProps) {
  const [busy, setBusy] = useState<null | 'saving' | 'deleting'>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);

  const run = async (kind: 'saving' | 'deleting', action: () => Promise<void>) => {
    setBusy(kind);
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (await run('saving', () => onUpdate(task._id, { title, description, priority }))) setEditing(false);
  };

  const startEdit = () => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setEditing(true);
  };

  const locked = busy !== null || pending;
  const field = 'w-full rounded-lg border border-line bg-paper px-3 py-2 text-[14.5px] outline-none focus:border-rust';

  return (
    <li className={`px-5 py-4 transition ${busy || pending ? 'opacity-60' : ''}`} aria-busy={busy !== null || pending}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          disabled={locked}
          onChange={() => run('saving', () => onUpdate(task._id, { completed: !task.completed }))}
          aria-label={`Mark "${task.title}" ${task.completed ? 'not done' : 'done'}`}
          className="mt-1.5 h-4 w-4 shrink-0 accent-[rgb(var(--rust))]"
        />

        {editing ? (
          <div className="min-w-0 flex-1 space-y-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" className={field} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} aria-label="Description" rows={2} className={field} />
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority" className={field}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} priority
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={save} disabled={locked} className="rounded-lg bg-ink px-3.5 py-1.5 text-[13.5px] font-semibold text-paper hover:bg-rust hover:text-rust-ink">
                {busy === 'saving' ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-lg px-3 py-1.5 text-[13.5px] text-ink-soft hover:bg-paper-sunk">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <p className={`font-medium ${task.completed ? 'text-ink-mute line-through' : ''}`}>{task.title}</p>
            {task.description && <p className="mt-0.5 text-[14.5px] text-ink-soft">{task.description}</p>}
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-ink-mute">
              <span className={`rounded px-1.5 py-px font-mono uppercase ${task.priority === 'high' ? 'bg-rust-soft text-rust' : 'bg-paper-sunk'}`}>
                {task.priority}
              </span>
              <span>{pending ? 'Saving…' : new Date(task.createdAt).toLocaleString()}</span>
            </p>
          </div>
        )}

        {!editing && (
          <div className="flex shrink-0 gap-1">
            <button type="button" onClick={startEdit} disabled={locked} className="rounded-lg px-2.5 py-1.5 text-[13px] text-ink-soft hover:bg-paper-sunk hover:text-ink">
              Edit
            </button>
            <button
              type="button"
              onClick={() => run('deleting', () => onDelete(task))}
              disabled={locked}
              className="rounded-lg px-2.5 py-1.5 text-[13px] text-ink-soft hover:bg-rust-soft hover:text-rust"
            >
              {busy === 'deleting' ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="ml-7 mt-2 text-[13.5px] text-rust">
          {error}
        </p>
      )}
    </li>
  );
}

// Memoised: a row re-renders only when its own props change, not whenever the list does.
export default memo(TaskItem);
