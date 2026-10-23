import { useHashRoute, VIEWS, type View } from './router/useHashRoute';

const VIEW_LABELS: Record<View, string> = {
  sheet: 'Sheet',
  spellbook: 'Spellbook',
  cheatsheet: 'Cheat sheet',
};

export default function App() {
  const [view, setView] = useHashRoute();
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <nav className="flex gap-2 border-b border-zinc-300 px-4 py-2 dark:border-zinc-800">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className="rounded px-3 py-1 text-sm aria-pressed:bg-zinc-800 aria-pressed:text-white dark:aria-pressed:bg-zinc-200 dark:aria-pressed:text-zinc-900"
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </nav>
      <main className="p-4">
        <h1 className="text-xl font-medium">{VIEW_LABELS[view]}</h1>
      </main>
    </div>
  );
}
