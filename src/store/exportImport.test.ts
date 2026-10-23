import { newCharacter } from '../model/character';
import { parseImport, serialize } from './exportImport';

describe('export/import', () => {
  it('round-trips characters', () => {
    const a = newCharacter('A');
    const b = newCharacter('B');
    const json = serialize([a, b]);
    expect(JSON.parse(json).app).toBe('dnd-sheet');
    const out = parseImport(json);
    expect(out.ok && out.characters).toEqual([a, b]);
  });

  it('rejects invalid import', () => {
    expect(parseImport('{}')).toEqual({ ok: false, error: expect.any(String) });
    expect(parseImport('not json').ok).toBe(false);
    expect(parseImport('{"app":"dnd-sheet","version":1,"characters":[]}').ok).toBe(false);
  });

  it('keeps good characters and drops bad ones', () => {
    const a = newCharacter('A');
    const json = JSON.stringify({ app: 'dnd-sheet', version: 1, characters: [{ junk: true }, a] });
    const out = parseImport(json);
    expect(out.ok && out.characters.map((c) => c.id)).toEqual([a.id]);
  });

  it('accepts a bare single character object', () => {
    const a = newCharacter('A');
    const out = parseImport(JSON.stringify(a));
    expect(out.ok && out.characters[0]?.id).toBe(a.id);
  });
});
