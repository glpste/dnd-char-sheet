import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { newCharacter, type Character } from '../model/character';
import type { StorageAdapter, StorageChange, StorageIndex } from '../storage/adapter';
import { CharacterProvider } from './CharacterProvider';
import { useCharacter, useRoster, useToast } from './useCharacter';

function fakeAdapter(seed: Character[] = []) {
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
    /** Simulate another tab writing a character. */
    emitExternal(c: Character) {
      chars.set(c.id, c);
      listeners.forEach((l) => l({ type: 'character', id: c.id }));
    },
  };
}

function Probe() {
  const { character, dispatch, saveState } = useCharacter();
  const roster = useRoster();
  const toasts = useToast();
  return (
    <div>
      <span data-testid="name">{character.info.name}</span>
      <span data-testid="save">{saveState}</span>
      <span data-testid="active">{roster.activeId}</span>
      <span data-testid="count">{roster.summaries.length}</span>
      <ul data-testid="toasts">
        {toasts.toasts.map((t) => (
          <li key={t.id}>{t.message}</li>
        ))}
      </ul>
      <button onClick={() => dispatch({ type: 'patch', patch: { info: { name: 'Renamed' } } })}>rename</button>
      <button onClick={() => roster.create('Second')}>create</button>
      <button onClick={() => roster.remove(roster.activeId!)}>remove</button>
    </div>
  );
}

function setup(seed?: Character[]) {
  const fake = fakeAdapter(seed);
  render(
    <CharacterProvider adapter={fake.adapter}>
      <Probe />
    </CharacterProvider>,
  );
  return fake;
}

describe('CharacterProvider', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('creates a first character when storage is empty', () => {
    const fake = setup();
    expect(screen.getByTestId('name')).toHaveTextContent('New character');
    expect(fake.index.characters).toHaveLength(1);
  });

  it('persists edits after the debounce and reports saved', async () => {
    const seed = newCharacter('Thalia');
    const fake = setup([seed]);
    await userEvent.click(screen.getByText('rename'));
    expect(screen.getByTestId('save')).toHaveTextContent('saving');
    expect(fake.chars.get(seed.id)?.info.name).toBe('Thalia');
    await act(() => vi.advanceTimersByTimeAsync(350));
    expect(fake.chars.get(seed.id)?.info.name).toBe('Renamed');
    expect(fake.index.characters[0]?.name).toBe('Renamed');
    expect(screen.getByTestId('save')).toHaveTextContent('saved');
  });

  it('adopts external change when idle', async () => {
    const seed = newCharacter('Thalia');
    const fake = setup([seed]);
    await act(async () => {
      fake.emitExternal({ ...seed, info: { ...seed.info, name: 'From other tab' } });
    });
    expect(screen.getByTestId('name')).toHaveTextContent('From other tab');
  });

  it('keeps local pending edit', async () => {
    const seed = newCharacter('Thalia');
    const fake = setup([seed]);
    await userEvent.click(screen.getByText('rename'));
    await act(async () => {
      fake.emitExternal({ ...seed, info: { ...seed.info, name: 'From other tab' } });
    });
    expect(screen.getByTestId('name')).toHaveTextContent('Renamed');
    expect(screen.getByTestId('toasts')).toHaveTextContent(
      'Another tab changed this character; your edit was kept',
    );
    await act(() => vi.advanceTimersByTimeAsync(350));
    expect(fake.chars.get(seed.id)?.info.name).toBe('Renamed');
  });

  it('create adds a summary and selects it', async () => {
    const fake = setup([newCharacter('Thalia')]);
    await userEvent.click(screen.getByText('create'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('name')).toHaveTextContent('Second');
    expect(fake.index.activeId).toBe(screen.getByTestId('active').textContent);
  });

  it('remove selects the next character, or creates a fresh one when none remain', async () => {
    const a = newCharacter('A');
    const b = newCharacter('B');
    const fake = setup([a, b]);
    await userEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('name')).toHaveTextContent('B');
    expect(fake.chars.has(a.id)).toBe(false);
    await userEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('name')).toHaveTextContent('New character');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});
