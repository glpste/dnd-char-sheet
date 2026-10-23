import type { Character } from '../model/character';
import { migrateCharacter } from '../storage/migrate';

export const EXPORT_APP = 'dnd-sheet';
export const EXPORT_VERSION = 1;

export interface ExportFile {
  app: typeof EXPORT_APP;
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  characters: Character[];
}

export type ImportParse =
  | { ok: true; characters: Character[]; skipped: number }
  | { ok: false; error: string };

export function serialize(characters: Character[]): string {
  const file: ExportFile = {
    app: EXPORT_APP,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    characters,
  };
  return JSON.stringify(file, null, 2);
}

/** Accepts an export file or a single bare character. Entries that do not migrate are counted in `skipped`. */
export function parseImport(json: string): ImportParse {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  let candidates: unknown[];
  if (typeof raw === 'object' && raw !== null && Array.isArray((raw as { characters?: unknown }).characters)) {
    candidates = (raw as { characters: unknown[] }).characters;
  } else {
    candidates = [raw];
  }
  const characters = candidates.map(migrateCharacter).filter((c): c is Character => c !== null);
  if (characters.length === 0) {
    return { ok: false, error: 'No characters found in that file.' };
  }
  return { ok: true, characters, skipped: candidates.length - characters.length };
}

export function downloadJson(filename: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  // Revoke after the click has been dispatched; some browsers abort the download if revoked synchronously.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'character';
}
