import { useState, type FormEvent } from 'react';
import { generateDescription, PRIORITIES, type Priority, type TaskInput } from '../../api';
import AiSuggestion from './AiSuggestion';

interface TaskFormProps {
  /** Resolves when the server confirmed the task; rejects with the server's message. */
  onCreate: (input: TaskInput) => Promise<void>;
}

export default function TaskForm({ onCreate }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI suggestion state: loading, the editable suggestion, or a notice when AI isn't available.
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onCreate({ title, description, priority });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setSuggestion(null);
      setAiNotice(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    setAiNotice(null);
    setSuggestion(null);
    try {
      const res = await generateDescription(title);
      if (res.fallback) setAiNotice(res.message ?? 'AI suggestions are unavailable right now.');
      else setSuggestion(res.description);
    } catch (err) {
      // e.g. validation (no title) or the rate limit — the form itself still works.
      setAiNotice((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const field = 'rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[14.5px] outline-none transition focus:border-rust';

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-paper-raised p-5">
      <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">New task</h2>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-[1fr_auto]">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" className={field} />
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority" className={field}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p} priority
            </option>
          ))}
        </select>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details (optional)"
          rows={2}
          className={`${field} resize-y sm:col-span-2`}
        />
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={generating || title.trim() === ''}
        title={title.trim() === '' ? 'Type a title first' : undefined}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-[13.5px] text-ink-soft transition hover:border-rust hover:text-rust disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generating && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-rust" aria-hidden />}
        {generating ? 'Generating…' : '✦ Generate description'}
      </button>

      {aiNotice && (
        <p role="status" className="mt-3 rounded-lg bg-paper-sunk px-3 py-2 text-[13.5px] text-ink-soft">
          {aiNotice}
        </p>
      )}
      {suggestion !== null && (
        <AiSuggestion
          text={suggestion}
          onChange={setSuggestion}
          onAccept={() => {
            setDescription(suggestion);
            setSuggestion(null);
          }}
          onDismiss={() => setSuggestion(null)}
        />
      )}

      {error && (
        <p role="alert" className="mt-3 text-[14px] text-rust">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="mt-4 block rounded-xl bg-ink px-5 py-2.5 text-[14.5px] font-semibold text-paper transition hover:bg-rust hover:text-rust-ink disabled:opacity-50"
      >
        {saving ? 'Adding…' : 'Add task'}
      </button>
    </form>
  );
}
