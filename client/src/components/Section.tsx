import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
}

/** Shared section frame so About, Skills and Projects don't repeat the same heading markup. */
export default function Section({ id, index, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line py-16 sm:py-20">
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <header>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">{index}</p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight">{title}</h2>
        </header>
        <div>{children}</div>
      </div>
    </section>
  );
}
