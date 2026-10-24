export default function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-10 text-ink-mute">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-rust" aria-hidden />
      <span className="font-mono text-[13px]">{label}</span>
    </div>
  );
}
