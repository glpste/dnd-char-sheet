import { HeaderBar, VIEW_LABELS } from './components/header/HeaderBar';
import { SheetView } from './components/sheet/SheetView';
import { SpellbookView } from './components/spellbook/SpellbookView';
import { ToastHost } from './components/ui/ToastHost';
import { useHashRoute } from './router/useHashRoute';

export default function App() {
  const [view, setView] = useHashRoute();
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <HeaderBar view={view} setView={setView} />
      <main className="min-h-0 flex-1 p-2">
        <h1 className="sr-only">{VIEW_LABELS[view]}</h1>
        {view === 'sheet' && <SheetView />}
        {view === 'spellbook' && <SpellbookView />}
      </main>
      <ToastHost />
    </div>
  );
}
