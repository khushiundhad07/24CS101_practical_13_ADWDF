import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api';

type Mode = 'login' | 'register';

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as { from?: string; notice?: string };
  const from = state.from && state.from !== '/login' ? state.from : '/tasks';

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  if (user) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    try {
      await (mode === 'login' ? login : register)(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && Object.keys(err.fields).length ? 'Please fix the highlighted fields.' : (err as Error).message);
      if (err instanceof ApiError) setFields(err.fields);
    } finally {
      setBusy(false);
    }
  };

  const input = (bad: boolean) =>
    `mt-2 w-full rounded-xl border bg-paper-raised px-4 py-3 outline-none transition focus:border-rust ${bad ? 'border-rust' : 'border-line'}`;

  return (
    <section className="mx-auto max-w-md py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">Account</p>
      <h1 className="mt-3 font-serif text-5xl font-medium tracking-tight">{mode === 'login' ? 'Welcome back.' : 'Create an account.'}</h1>

      {state.notice && (
        <p role="status" className="mt-6 rounded-xl bg-rust-soft px-4 py-3 text-[14px] text-ink">
          {state.notice}
        </p>
      )}

      <div role="tablist" className="mt-8 grid grid-cols-2 rounded-xl border border-line bg-paper-sunk p-1 text-[14px]">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
              setFields({});
            }}
            className={`rounded-lg py-2 font-medium transition ${mode === m ? 'bg-paper-raised text-ink shadow-sm' : 'text-ink-mute hover:text-ink'}`}
          >
            {m === 'login' ? 'Log in' : 'Register'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
        <label className="block">
          <span className="text-[14px] font-medium">Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input(!!fields.email)} />
          {fields.email && <span className="mt-1 block text-[13px] text-rust">{fields.email}</span>}
        </label>
        <label className="block">
          <span className="text-[14px] font-medium">Password</span>
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input(!!fields.password)}
          />
          {fields.password ? (
            <span className="mt-1 block text-[13px] text-rust">{fields.password}</span>
          ) : (
            mode === 'register' && <span className="mt-1 block text-[13px] text-ink-mute">At least 8 characters.</span>
          )}
        </label>

        {error && (
          <p role="alert" className="text-[14px] text-rust">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-ink px-5 py-3 text-[15px] font-semibold text-paper transition hover:bg-rust hover:text-rust-ink disabled:opacity-50"
        >
          {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
    </section>
  );
}
