import type { ContactLink } from '../data/profile';

interface FooterProps {
  name: string;
  links: ContactLink[];
}

export default function Footer({ name, links }: FooterProps) {
  return (
    <footer id="contact" className="scroll-mt-20 border-t border-line pb-12 pt-16 sm:pt-20">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">Contact</p>
      <h2 className="mt-3 max-w-xl font-serif text-4xl font-medium tracking-tight">
        Let’s build something useful together.
      </h2>
      <ul className="mt-8 flex flex-wrap gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target={l.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer"
              className="inline-block rounded-xl border border-line bg-paper-raised px-4 py-2.5 text-[14.5px] font-medium transition hover:border-rust hover:text-rust"
            >
              {l.label} ↗
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-14 text-[13px] text-ink-mute">
        © {new Date().getFullYear()} {name}. Built with React and Vite.
      </p>
    </footer>
  );
}
