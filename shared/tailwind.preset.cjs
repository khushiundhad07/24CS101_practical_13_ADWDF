// Tailwind preset shared by the landing app and every practical client.
// Colours come from CSS variables in shared/theme.css, so the `dark` class swaps them.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: v('paper'), raised: v('paper-raised'), sunk: v('paper-sunk') },
        ink: { DEFAULT: v('ink'), soft: v('ink-soft'), mute: v('ink-mute') },
        line: v('line'),
        rust: { DEFAULT: v('rust'), soft: v('rust-soft'), ink: v('rust-ink') },
        moss: v('moss'),
        code: { DEFAULT: v('code'), ink: v('code-ink') },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
      boxShadow: {
        lift: '0 1px 0 rgb(0 0 0 / 0.03), 0 12px 32px -18px rgb(0 0 0 / 0.35)',
      },
    },
  },
};
