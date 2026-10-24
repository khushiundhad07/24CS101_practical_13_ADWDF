import { useEffect, useState } from 'react';

/** Dark / light mode kept in useState and applied as a `dark` class on the root <html> element. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      aria-pressed={dark}
      className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink-soft transition hover:border-ink-mute hover:text-ink"
    >
      {dark ? 'Light' : 'Dark'} mode
    </button>
  );
}
