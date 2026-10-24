interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="rounded-2xl border border-rust/40 bg-rust-soft/60 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-rust">Something went wrong</p>
      <p className="mt-2 text-ink-soft">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl bg-ink px-4 py-2 text-[14px] font-semibold text-paper transition hover:bg-rust hover:text-rust-ink"
        >
          Try again
        </button>
      )}
    </div>
  );
}
