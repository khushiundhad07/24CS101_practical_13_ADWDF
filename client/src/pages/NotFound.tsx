import { Link, useLocation } from 'react-router-dom';

export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <section className="py-24">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-rust">404 · Not found</p>
      <h1 className="mt-4 font-serif text-6xl font-light tracking-tight">This page wandered off.</h1>
      <p className="mt-5 text-ink-soft">
        Nothing lives at <code className="rounded bg-paper-sunk px-1.5 py-0.5 font-mono text-[14px]">{pathname}</code>.
      </p>
      <Link to="/" className="mt-8 inline-block rounded-xl bg-ink px-5 py-3 text-[14.5px] font-semibold text-paper hover:bg-rust hover:text-rust-ink">
        Back home
      </Link>
    </section>
  );
}
