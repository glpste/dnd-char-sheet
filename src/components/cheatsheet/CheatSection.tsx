import { useState } from 'react';
import type { CheatSection as Section } from '../../rules/srdCheatSheet';
import { cx, panel } from '../ui/styles';

export function CheatSection({ section, highlight }: { section: Section; highlight: string }) {
  const [open, setOpen] = useState(true);
  const q = highlight.trim().toLowerCase();
  return (
    <section data-testid="cheat-section" data-title={section.title} className={cx(panel, 'px-3 py-2')}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left text-sm font-medium"
      >
        {section.title}
        <span aria-hidden="true" className="text-xs text-zinc-400">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && (
        <ul className="mt-1 space-y-0.5 text-sm leading-snug text-zinc-700 dark:text-zinc-300">
          {section.lines.map((line) => (
            <li
              key={line}
              className={cx(
                'border-l-2 pl-2',
                q && line.toLowerCase().includes(q)
                  ? 'border-amber-500 text-zinc-900 dark:text-zinc-50'
                  : 'border-zinc-200 dark:border-zinc-800',
              )}
            >
              {line}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
