import { newCharacter } from '../model/character';
import { createLocalStorageAdapter } from './localStorageAdapter';

describe('localStorage adapter', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips a character', () => {
    const a = createLocalStorageAdapter();
    const c = newCharacter('Thalia');
    a.saveCharacter(c);
    expect(a.loadCharacter(c.id)).toEqual(c);
  });

  it('returns an empty index on fresh storage', () => {
    expect(createLocalStorageAdapter().loadIndex()).toEqual({ activeId: null, characters: [] });
  });

  it('round-trips the index', () => {
    const a = createLocalStorageAdapter();
    const index = { activeId: 'x', characters: [{ id: 'x', name: 'X', updatedAt: 't' }] };
    a.saveIndex(index);
    expect(a.loadIndex()).toEqual(index);
  });

  it('deletes a character key', () => {
    const a = createLocalStorageAdapter();
    const c = newCharacter();
    a.saveCharacter(c);
    a.deleteCharacter(c.id);
    expect(a.loadCharacter(c.id)).toBeNull();
    expect(localStorage.getItem(`dnd-sheet:v1:char:${c.id}`)).toBeNull();
  });

  it('skips corrupt character', () => {
    localStorage.setItem('dnd-sheet:v1:char:bad', '{not json');
    localStorage.setItem('dnd-sheet:v1:char:wrong', JSON.stringify({ hello: 'world' }));
    const a = createLocalStorageAdapter();
    expect(() => a.loadCharacter('bad')).not.toThrow();
    expect(a.loadCharacter('bad')).toBeNull();
    expect(a.loadCharacter('wrong')).toBeNull();
  });

  it('notifies subscribers of storage events for our keys only', () => {
    const a = createLocalStorageAdapter();
    const seen: unknown[] = [];
    const unsubscribe = a.subscribe((e) => seen.push(e));
    window.dispatchEvent(new StorageEvent('storage', { key: 'dnd-sheet:v1:char:abc' }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'dnd-sheet:v1:index' }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated' }));
    expect(seen).toEqual([{ type: 'character', id: 'abc' }, { type: 'index' }]);
    unsubscribe();
    window.dispatchEvent(new StorageEvent('storage', { key: 'dnd-sheet:v1:index' }));
    expect(seen).toHaveLength(2);
  });
});
