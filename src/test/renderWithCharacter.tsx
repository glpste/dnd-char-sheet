import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { newCharacter, type Character } from '../model/character';
import type { StorageAdapter, StorageChange, StorageIndex } from '../storage/adapter';
import { CharacterProvider } from '../store/CharacterProvider';

/** In-memory adapter for component tests; `emitExternal` simulates another tab. */
export function memoryAdapter(seed: Character[] = []) {
  const chars = new Map(seed.map((c) => [c.id, c]));
  let index: StorageIndex = {
    activeId: seed[0]?.id ?? null,
    characters: seed.map((c) => ({ id: c.id, name: c.info.name, updatedAt: c.updatedAt })),
  };
  const listeners = new Set<(c: StorageChange) => void>();
  const adapter: StorageAdapter = {
    loadIndex: () => index,
    saveIndex: (i) => {
      index = i;
    },
    loadCharacter: (id) => chars.get(id) ?? null,
    saveCharacter: (c) => {
      chars.set(c.id, c);
    },
    deleteCharacter: (id) => {
      chars.delete(id);
    },
    subscribe: (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
  return {
    adapter,
    chars,
    get index() {
      return index;
    },
    emitExternal(c: Character) {
      chars.set(c.id, c);
      listeners.forEach((l) => l({ type: 'character', id: c.id }));
    },
  };
}

/** A level-5 ranger used across component tests: STR 16, DEX 18, CON 14, INT 10, WIS 15, CHA 8. */
export function ranger(): Character {
  const c = newCharacter('Thalia');
  c.info.level = 5;
  c.abilities = { str: 16, dex: 18, con: 14, int: 10, wis: 15, cha: 8 };
  c.combat.hp = { max: 44, current: 31, temp: 5 };
  return c;
}

export function renderWithCharacter(ui: ReactNode, character: Character = ranger()) {
  const store = memoryAdapter([character]);
  const result = render(<CharacterProvider adapter={store.adapter}>{ui}</CharacterProvider>);
  return { ...result, store, character };
}
