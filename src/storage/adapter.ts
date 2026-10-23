import type { Character } from '../model/character';

export interface CharacterSummary {
  id: string;
  name: string;
  updatedAt: string;
}

export interface StorageIndex {
  activeId: string | null;
  characters: CharacterSummary[];
}

export type StorageChange = { type: 'character'; id: string } | { type: 'index' };

/**
 * Persistence boundary. localStorage today; a remote backend later only has to
 * implement this interface (subscribe carries external changes, e.g. other tabs).
 */
export interface StorageAdapter {
  loadIndex(): StorageIndex;
  saveIndex(index: StorageIndex): void;
  loadCharacter(id: string): Character | null;
  saveCharacter(character: Character): void;
  deleteCharacter(id: string): void;
  subscribe(onChange: (change: StorageChange) => void): () => void;
}

export const EMPTY_INDEX: StorageIndex = { activeId: null, characters: [] };
