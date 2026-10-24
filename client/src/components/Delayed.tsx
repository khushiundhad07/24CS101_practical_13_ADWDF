import { useEffect, useState, type ReactNode } from 'react';

/**
 * Renders nothing for the first `ms` milliseconds, then its children.
 * Used as a Suspense fallback: chunks that arrive quickly (fast connections, cached files)
 * never flash a loading state; only genuinely slow loads show one.
 */
export default function Delayed({ ms = 300, children }: { ms?: number; children: ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShow(true), ms);
    return () => clearTimeout(id);
  }, [ms]);

  return show ? <>{children}</> : null;
}
