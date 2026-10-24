import { useState, type FormEvent } from 'react';
import { contacts, profile } from '../data/profile';

const EMAIL = contacts.find((c) => c.label === 'Email')!.href.replace('mailto:', '');
const MAX = 500;

export default function Contact() {
  // Controlled inputs: React state is the single source of truth for what is typed.
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  // UI visibility state: whether the help tip is open.
  const [showHelp, setShowHelp] = useState(false);

  const canSend = name.trim() !== '' && message.trim() !== '';

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    const subject = encodeURIComponent(`Hello from ${name.trim()}`);
    const body = encodeURIComponent(message.trim());
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="grid gap-10 py-16 md:grid-cols-[1fr_1fr]">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">Contact</p>
        <h1 className="mt-3 font-serif text-5xl font-medium tracking-tight">Say hello.</h1>
        <p className="mt-4 max-w-md text-ink-soft">
          Write a note to {profile.name.split(' ')[0]}. The preview updates as you type; sending opens your mail app.
        </p>

        <form onSubmit={send} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-[14px] font-medium">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-paper-raised px-4 py-3 outline-none transition focus:border-rust"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-[14px] font-medium">
              Message
              <button
                type="button"
                onClick={() => setShowHelp((v) => !v)}
                aria-expanded={showHelp}
                aria-controls="message-help"
                className="grid h-5 w-5 place-items-center rounded-full border border-line font-mono text-[11px] text-ink-mute hover:border-rust hover:text-rust"
              >
                ?
              </button>
            </span>
            {showHelp && (
              <span id="message-help" className="mt-2 block rounded-lg bg-rust-soft px-3 py-2 text-[13.5px] text-ink-soft">
                Mention what you’d like to work on together and how to reach you back.
              </span>
            )}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={MAX}
              aria-describedby="message-count"
              className="mt-2 w-full resize-y rounded-xl border border-line bg-paper-raised px-4 py-3 outline-none transition focus:border-rust"
              placeholder="Hi Urja, …"
            />
            <span
              id="message-count"
              className={`mt-1 block text-right font-mono text-[12px] ${message.length > MAX * 0.9 ? 'text-rust' : 'text-ink-mute'}`}
            >
              {message.length} / {MAX}
            </span>
          </label>

          <button
            type="submit"
            disabled={!canSend}
            className="rounded-xl bg-ink px-5 py-3 text-[14.5px] font-semibold text-paper transition hover:bg-rust hover:text-rust-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send message
          </button>
        </form>
      </div>

      <aside aria-live="polite" className="self-start rounded-2xl border border-line bg-paper-raised p-6 md:mt-[118px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-rust">Live preview</p>
        <p className="mt-4 text-[14px] text-ink-mute">From</p>
        <p className="font-semibold">{name || '—'}</p>
        <p className="mt-4 text-[14px] text-ink-mute">Message</p>
        <p className="whitespace-pre-wrap break-words text-ink-soft">{message || 'Start typing to see your message here.'}</p>
      </aside>
    </section>
  );
}
