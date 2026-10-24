import type { SkillGroup } from '../data/profile';
import Section from './Section';

export default function Skills({ skillList }: { skillList: SkillGroup[] }) {
  return (
    <Section id="skills" index="02" title="Skills">
      <div className="divide-y divide-line rounded-2xl border border-line bg-paper-raised">
        {skillList.map((s) => (
          <div key={s.group} className="grid gap-3 p-5 sm:grid-cols-[130px_1fr]">
            <h3 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute sm:pt-1">{s.group}</h3>
            <ul className="flex flex-wrap gap-2">
              {s.items.map((item) => (
                <li key={item} className="rounded-full border border-line px-3 py-1 text-[14px]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
