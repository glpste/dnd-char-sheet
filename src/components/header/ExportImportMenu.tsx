import { useEffect, useRef, useState } from 'react';
import type { ImportResult } from '../../store/CharacterProvider';
import { downloadJson, parseImport, slugify } from '../../store/exportImport';
import { useRoster, useToast } from '../../store/useCharacter';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { btn, menu, menuItem } from '../ui/styles';

export function importResultMessage(result: ImportResult): string {
  if (!result.ok) return result.error;
  const base = `Imported ${result.count} character${result.count === 1 ? '' : 's'}`;
  return result.skipped > 0 ? `${base}, ${result.skipped} skipped` : base;
}

export function ExportImportMenu() {
  const { summaries, activeId, exportAll, exportOne, importJson } = useRoster();
  const { pushToast } = useToast();
  const [open, setOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ json: string; count: number; skipped: number } | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const activeName = summaries.find((s) => s.id === activeId)?.name ?? 'character';
  const today = new Date().toISOString().slice(0, 10);

  /** Parses pasted or loaded JSON and, if valid, asks how to import it. Returns whether it parsed. */
  const handleJsonText = (json: string): boolean => {
    const parsed = parseImport(json);
    if (!parsed.ok) {
      pushToast(parsed.error);
      return false;
    }
    setPendingImport({ json, count: parsed.characters.length, skipped: parsed.skipped });
    return true;
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    handleJsonText(await file.text());
  };

  const submitPaste = () => {
    if (handleJsonText(pasteText)) {
      setPasteOpen(false);
      setPasteText('');
    }
  };

  const finishImport = (mode: 'add' | 'replace') => {
    if (!pendingImport) return;
    const result = importJson(pendingImport.json, mode);
    setPendingImport(null);
    pushToast(importResultMessage(result));
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
          <button
            role="menuitem"
            type="button"
            className={menuItem}
            onClick={() => {
              setOpen(false);
              setPasteOpen(true);
            }}
          >
            Paste JSON…
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
      <ConfirmDialog open={pasteOpen} title="Paste JSON" confirmLabel="Import" onConfirm={submitPaste} onCancel={() => setPasteOpen(false)}>
        <p>Paste an exported character (or export file) below.</p>
        <textarea
          aria-label="Character JSON"
          className="mt-2 h-40 w-full rounded border border-zinc-300 bg-white p-2 font-mono text-xs text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          spellCheck={false}
        />
      </ConfirmDialog>
      <ConfirmDialog
        open={pendingImport !== null}
        title="Import characters"
        confirmLabel="Add as new"
        secondaryLabel="Replace existing"
        onSecondary={() => finishImport('replace')}
        onConfirm={() => finishImport('add')}
        onCancel={() => setPendingImport(null)}
      >
        Found {pendingImport?.count} character{pendingImport?.count === 1 ? '' : 's'}
        {pendingImport && pendingImport.skipped > 0 ? ` (${pendingImport.skipped} unreadable entr${pendingImport.skipped === 1 ? 'y' : 'ies'} will be skipped)` : ''}.
        Add them as new characters, or replace any existing character that has the same id?
      </ConfirmDialog>
    </div>
  );
}
