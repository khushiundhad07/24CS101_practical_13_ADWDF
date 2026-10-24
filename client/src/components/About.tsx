import Section from './Section';

interface AboutProps {
  bio: string;
  education: { degree: string; school: string; period: string };
  internship: { company: string; title: string; period: string; place: string; summary: string };
}

export default function About({ bio, education, internship }: AboutProps) {
  return (
    <Section id="about" index="01" title="About">
      <p className="max-w-2xl text-xl leading-relaxed">{bio}</p>
      <dl className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-rust">Education</dt>
          <dd className="mt-3">
            <span className="block font-semibold">{education.degree}</span>
            <span className="mt-1 block text-[14.5px] text-ink-soft">{education.school}</span>
            <span className="mt-2 block font-mono text-[12.5px] text-ink-mute">{education.period}</span>
          </dd>
        </div>
        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-rust">Internship</dt>
          <dd className="mt-3">
            <span className="block font-semibold">
              {internship.title}, {internship.company}
            </span>
            <span className="mt-1 block text-[14.5px] text-ink-soft">{internship.summary}</span>
            <span className="mt-2 block font-mono text-[12.5px] text-ink-mute">
              {internship.period} · {internship.place}
            </span>
          </dd>
        </div>
      </dl>
    </Section>
  );
}
