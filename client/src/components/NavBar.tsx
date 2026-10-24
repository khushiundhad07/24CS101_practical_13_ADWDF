import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects', end: false },
  { to: '/tasks', label: 'Tasks', end: false },
  { to: '/contact', label: 'Contact', end: false },
];

/** Uses NavLink (not <a>) so moving between routes never reloads the page. */
export default function NavBar({ children }: { children?: ReactNode }) {
  return (
    <nav className="sticky top-0 z-20 -mx-4 border-b border-line bg-paper/85 px-4 backdrop-blur">
      <ul className="flex h-14 items-center gap-1 text-[14px]">
        <li className="mr-auto font-serif text-lg">
          <NavLink to="/">UG.</NavLink>
        </li>
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 transition ${isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
        {children && <li className="ml-2">{children}</li>}
      </ul>
    </nav>
  );
}
