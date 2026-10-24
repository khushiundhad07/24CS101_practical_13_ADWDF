import type { Project } from '../data/profile';
import Section from './Section';

export default function Projects({ projects }: { projects: Project[] }) {
  return (
    <Section id="projects" index="03" title="Projects">
      <ol className="space-y-4">
        {projects.map((p) => (
          <li key={p.name} className="rounded-2xl border border-line bg-paper-raised p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-serif text-2xl font-medium">{p.name}</h3>
              <span className="font-mono text-[12.5px] text-ink-mute">{p.year}</span>
            </div>
            <p className="mt-1 text-[14.5px] text-rust">{p.tagline}</p>
            <ul className="mt-4 space-y-2 text-[15px] text-ink-soft">
              {p.points.map((pt) => (
                <li key={pt} className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-rust">
                  {pt}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {p.stack.map((t) => (
                <span key={t} className="rounded-md bg-paper-sunk px-2 py-0.5 font-mono text-[12px] text-ink-soft">
                  {t}
                </span>
              ))}
              {p.href && (
                <a href={p.href} target="_blank" rel="noreferrer" className="ml-auto text-[14px] font-medium text-rust hover:underline">
                  Repository ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
