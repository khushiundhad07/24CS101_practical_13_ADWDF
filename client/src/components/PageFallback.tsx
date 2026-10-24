/** Shown by <Suspense> while a lazily loaded page's chunk downloads. Shaped like a page so nothing jumps. */
export default function PageFallback() {
  return (
    <div role="status" aria-label="Loading page" className="animate-pulse py-14">
      <div className="h-3 w-40 rounded bg-paper-sunk" />
      <div className="mt-5 h-12 w-2/3 max-w-md rounded-lg bg-paper-sunk" />
      <div className="mt-4 h-4 w-full max-w-xl rounded bg-paper-sunk" />
      <div className="mt-2 h-4 w-4/5 max-w-lg rounded bg-paper-sunk" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-2xl bg-paper-sunk" />
        <div className="h-40 rounded-2xl bg-paper-sunk" />
      </div>
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
