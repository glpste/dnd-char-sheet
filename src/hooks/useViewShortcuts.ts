import { useEffect } from 'react';
import { VIEWS, type View } from '../router/useHashRoute';

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/** Keys 1/2/3 switch between Sheet, Spellbook and Cheat sheet when no field is focused. */
export function useViewShortcuts(setView: (v: View) => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      const index = Number.parseInt(e.key, 10) - 1;
      const view = VIEWS[index];
      if (view) setView(view);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setView]);
}
