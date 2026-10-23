import type { Character } from '../model/character';
import { EMPTY_INDEX, type StorageAdapter, type StorageChange, type StorageIndex } from './adapter';
import { migrateCharacter } from './migrate';

export const INDEX_KEY = 'dnd-sheet:v1:index';
export const CHAR_PREFIX = 'dnd-sheet:v1:char:';

export function characterKey(id: string): string {
  return `${CHAR_PREFIX}${id}`;
}

function parseJson(text: string | null): unknown {
  if (text === null) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export function createLocalStorageAdapter(storage: Storage = window.localStorage): StorageAdapter {
  return {
    loadIndex() {
      const raw = parseJson(storage.getItem(INDEX_KEY));
      if (typeof raw !== 'object' || raw === null) return { ...EMPTY_INDEX, characters: [] };
      const r = raw as Partial<StorageIndex>;
      const characters = (Array.isArray(r.characters) ? r.characters : []).filter(
        (s): s is StorageIndex['characters'][number] =>
          typeof s === 'object' && s !== null && typeof (s as { id?: unknown }).id === 'string',
      ).map((s) => ({ id: s.id, name: typeof s.name === 'string' ? s.name : '', updatedAt: typeof s.updatedAt === 'string' ? s.updatedAt : '' }));
      return {
        activeId: typeof r.activeId === 'string' ? r.activeId : null,
        characters,
      };
    },
    saveIndex(index) {
      storage.setItem(INDEX_KEY, JSON.stringify(index));
    },
    loadCharacter(id) {
      const raw = parseJson(storage.getItem(characterKey(id)));
      const c = migrateCharacter(raw);
      if (!c && raw !== null) console.warn(`dnd-sheet: ignoring corrupt character record ${id}`);
      return c;
    },
    saveCharacter(character: Character) {
      storage.setItem(characterKey(character.id), JSON.stringify(character));
    },
    deleteCharacter(id) {
      storage.removeItem(characterKey(id));
    },
    subscribe(onChange: (change: StorageChange) => void) {
      const handler = (e: StorageEvent) => {
        if (e.key === INDEX_KEY) onChange({ type: 'index' });
        else if (e.key?.startsWith(CHAR_PREFIX)) onChange({ type: 'character', id: e.key.slice(CHAR_PREFIX.length) });
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    },
  };
}
