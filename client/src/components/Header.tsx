interface HeaderProps {
  name: string;
  role: string;
  focus: string;
  /** Accent colour for the name, applied as an inline style. */
  themeColor?: string;
}

export default function Header({ name, role, focus, themeColor }: HeaderProps) {
  const [first, ...rest] = name.split(' ');
  return (
    <header id="top" className="pb-16 pt-20 sm:pb-24 sm:pt-28">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">Portfolio · {role}</p>
      <h1 className="mt-6 font-serif text-[clamp(52px,10vw,120px)] font-light leading-[0.92] tracking-[-0.04em]">
        {first}
        <br />
        <em className="font-normal" style={{ color: themeColor }}>
          {rest.join(' ')}
        </em>
      </h1>
      <p className="mt-8 max-w-xl text-lg text-ink-soft">{focus}.</p>
    </header>
  );
}
