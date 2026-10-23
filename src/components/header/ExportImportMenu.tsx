import { useEffect, useRef, useState } from 'react';
import { downloadJson, parseImport, slugify } from '../../store/exportImport';
import { useRoster, useToast } from '../../store/useCharacter';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { btn, menu, menuItem } from '../ui/styles';

export function ExportImportMenu() {
  const { summaries, activeId, exportAll, exportOne, importJson } = useRoster();
  const { pushToast } = useToast();
  const [open, setOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ json: string; count: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const activeName = summaries.find((s) => s.id === activeId)?.name ?? 'character';
  const today = new Date().toISOString().slice(0, 10);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const json = await file.text();
    const parsed = parseImport(json);
    if (!parsed.ok) {
      pushToast(parsed.error);
      return;
    }
    setPendingImport({ json, count: parsed.characters.length });
  };

  const finishImport = (mode: 'add' | 'replace') => {
    if (!pendingImport) return;
    const result = importJson(pendingImport.json, mode);
    setPendingImport(null);
    pushToast(result.ok ? `Imported ${result.count} character${result.count === 1 ? '' : 's'}` : result.error);
  };

  return (
    <div ref={rootRef} className="relative">
      <button type="button" className={btn} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Export / import
      </button>
      {open && (
        <div role="menu" className={`${menu} right-0`}>
          <button
            role="menuitem"
            type="button"
            className={menuItem}
            onClick={() => {
              setOpen(false);
              downloadJson(`${slugify(activeName)}-${today}.json`, exportOne(activeId));
            }}
          >
            Export {activeName}
          </button>
          <button
            role="menuitem"
            type="button"
            className={menuItem}
            onClick={() => {
              setOpen(false);
              downloadJson(`dnd-characters-${today}.json`, exportAll());
            }}
          >
            Export all characters
          </button>
          <hr className="my-1 border-zinc-200 dark:border-zinc-700" />
          <button
            role="menuitem"
            type="button"
            className={menuItem}
            onClick={() => {
              setOpen(false);
              fileRef.current?.click();
            }}
          >
            Import from file…
          </button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Import file"
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <ConfirmDialog
        open={pendingImport !== null}
        title="Import characters"
        confirmLabel="Add as new"
        secondaryLabel="Replace existing"
        onSecondary={() => finishImport('replace')}
        onConfirm={() => finishImport('add')}
        onCancel={() => setPendingImport(null)}
      >
        Found {pendingImport?.count} character{pendingImport?.count === 1 ? '' : 's'}. Add them as new
        characters, or replace any existing character that has the same id?
      </ConfirmDialog>
    </div>
  );
}
